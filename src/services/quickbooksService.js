// src/services/quickbooksService.js
export default class QuickBooksService {
    constructor() {
        this.clientId = import.meta.env.VITE_QB_CLIENT_ID;
        this.redirectUri = import.meta.env.VITE_QB_REDIRECT_URI;
        this.scope = 'com.intuit.quickbooks.accounting';
        this.baseUrl = import.meta.env.VITE_QB_ENVIRONMENT === 'production'
            ? 'https://quickbooks.api.intuit.com'
            : 'https://sandbox-quickbooks.api.intuit.com';
        // Asegúrate de que esta URL apunte a donde realmente está tu PHP
        this.phpBackendUrl = 'https://codeo.site/logistica/api-logistica/quickbooks-backend/callback.php';
    }

    async makeApiCall(endpoint, method = 'GET', body = null) {
        try {
            const accessToken = localStorage.getItem('qb_access_token');
            const realmId = localStorage.getItem('qb_realmId');

            console.log('Attempting API call to:', this.phpBackendUrl);
            console.log('With payload:', {
                qbEndpoint: endpoint,
                qbMethod: method,
                qbBody: body,
                accessToken: accessToken ? 'present' : 'missing',
                realmId: realmId ? 'present' : 'missing'
            });

            const response = await fetch(this.phpBackendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    qbEndpoint: endpoint,
                    qbMethod: method,
                    qbBody: body,
                    accessToken,
                    realmId
                })
            });

            // Log response status
            console.log('Response status:', response.status);

            const textResponse = await response.text();
            console.log('Raw response:', textResponse);

            try {
                const jsonResponse = textResponse ? JSON.parse(textResponse) : {};
                if (!response.ok) {
                    throw new Error(`HTTP Error ${response.status}: ${jsonResponse.error || 'Unknown error'}`);
                }
                return jsonResponse;
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                throw new Error(`Invalid response format: ${textResponse}`);
            }
        } catch (error) {
            console.error('API Call Error:', error);
            throw error;
        }
    }
    async createInvoice(invoiceData) {
        try {
            console.log('Creating invoice with data:', invoiceData);
            const qbInvoiceData = {
                Line: (invoiceData.items || []).map(item => ({
                    DetailType: "SalesItemLineDetail",
                    Amount: parseFloat(item.monto),
                    Description: item.descripcion,
                    SalesItemLineDetail: {
                        Qty: item.cantidad || 1,
                        UnitPrice: parseFloat(item.precioUnitario || item.monto),
                        TaxCodeRef: {
                            value: "NON"
                        }
                    }
                })),
                CustomerRef: {
                    value: invoiceData.CustomerRef.value
                },
                TxnDate: invoiceData.fechaEmision,
                DueDate: invoiceData.fechaVencimiento,
                DocNumber: invoiceData.numeroFactura
            };

            if (invoiceData.fechaEmision) {
                qbInvoiceData.TxnDate = invoiceData.fechaEmision;
            }
            if (invoiceData.fechaVencimiento) {
                qbInvoiceData.DueDate = invoiceData.fechaVencimiento;
            }

            console.log('Formatted QB invoice data:', qbInvoiceData);

            const response = await this.makeApiCall('invoice', 'POST', qbInvoiceData);
            return response.Invoice;
        } catch (error) {
            console.error('Error al crear factura:', error);
            throw error;
        }
    }

    getAuthorizationUrl() {
        const authEndpoint = 'https://appcenter.intuit.com/connect/oauth2';
        const state = Math.random().toString(36).substring(7);

        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            scope: this.scope,
            redirect_uri: this.redirectUri,
            state: state
        });

        localStorage.setItem('qb_auth_state', state);
        return `${authEndpoint}?${params.toString()}`;
    }

    async exchangeCodeForTokens(code) {
        try {
            const realmId = new URLSearchParams(window.location.search).get('realmId');

            // Agregar logs para debug
            console.log('Exchanging code for tokens:', {
                code,
                realmId,
                backendUrl: this.phpBackendUrl
            });

            const response = await fetch(this.phpBackendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Importante para CORS
                body: JSON.stringify({
                    code,
                    realmId
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const tokens = await response.json();
            this.saveTokens(tokens);
            return tokens;
        } catch (error) {
            console.error('Error detallado al intercambiar el código:', error);
            throw new Error(`Error al conectar con QuickBooks: ${error.message}`);
        }
    }

    saveTokens(tokens) {
        localStorage.setItem('qb_access_token', tokens.access_token);
        localStorage.setItem('qb_refresh_token', tokens.refresh_token);
        localStorage.setItem('qb_realmId', tokens.realmId);
    }

    isConnected() {
        return !!localStorage.getItem('qb_access_token');
    }

    disconnect() {
        localStorage.removeItem('qb_access_token');
        localStorage.removeItem('qb_refresh_token');
        localStorage.removeItem('qb_realmId');
        localStorage.removeItem('qb_auth_state');
    }

    async findOrCreateCustomer(customerData) {
        try {
            // Escapar caracteres especiales en el nombre del cliente
            const escapedName = customerData.nombre.replace(/'/g, "\\'");
            const query = `SELECT * FROM Customer WHERE DisplayName = '${escapedName}'`;
            console.log('Customer query:', query);

            const response = await this.makeApiCall(`query?query=${encodeURIComponent(query)}`);

            console.log('Customer search response:', response);

            if (response.QueryResponse?.Customer?.[0]) {
                return response.QueryResponse.Customer[0];
            }

            // Si no existe, crear nuevo cliente
            const newCustomer = {
                DisplayName: customerData.nombre,
                PrimaryEmailAddr: customerData.email ? { Address: customerData.email } : undefined,
                PrimaryPhone: customerData.telefono ? { FreeFormNumber: customerData.telefono } : undefined,
                BillAddr: customerData.direccion ? {
                    Line1: customerData.direccion,
                    City: customerData.ciudad || '',
                    Country: customerData.pais || 'España'
                } : undefined
            };

            console.log('Creating new customer:', newCustomer);
            const createResponse = await this.makeApiCall('customer', 'POST', newCustomer);
            return createResponse.Customer;
        } catch (error) {
            console.error('Error detallado en findOrCreateCustomer:', error);
            throw error;
        }
    }

    async getInvoicePdf(invoiceId) {
        try {
            const response = await this.makeApiCall(`invoice/${invoiceId}/pdf`, 'GET');
            return response.pdfUrl;
        } catch (error) {
            console.error('Error al obtener PDF de factura:', error);
            throw error;
        }
    }

    async updateInvoiceStatus(invoiceId, status) {
        try {
            const invoice = await this.makeApiCall(`invoice/${invoiceId}`, 'GET');
            const updateData = {
                ...invoice,
                Id: invoiceId,
                sparse: true,
                PaymentStatus: status
            };

            const response = await this.makeApiCall(`invoice?operation=update`, 'POST', updateData);
            return response.Invoice;
        } catch (error) {
            console.error('Error al actualizar estado de factura:', error);
            throw error;
        }
    }
}