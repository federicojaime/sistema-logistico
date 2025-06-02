import React, { useState, useEffect } from 'react';
import { X, Mail, Paperclip, Send, Loader } from 'lucide-react';
import { clientsService } from '../../services/clientsService';

const EmailComposeModal = ({ 
    isOpen, 
    onClose, 
    shipment, 
    selectedDocuments = [], 
    userEmail = "",
    companyInfo = {}
}) => {
    const [emailData, setEmailData] = useState({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: ''
    });
    const [isSending, setIsSending] = useState(false);
    const [loadingClientEmail, setLoadingClientEmail] = useState(false);
    const [emailLoaded, setEmailLoaded] = useState(false);

    // Configuración de la empresa
    const companyConfig = {
        name: 'ALS Logistics',
        phone: '+1 (786) 123-4567',
        email: 'info@alslogistics.com',
        website: 'www.alslogistics.com',
        address: 'Miami, Florida',
        slogan: 'Tu partner logístico de confianza',
        subSlogan: 'Soluciones integrales de transporte'
    };

    useEffect(() => {
        if (isOpen && shipment && !emailLoaded) {
            loadClientEmailAndSetupData();
        }
    }, [isOpen, shipment]);

    // Reset cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setEmailLoaded(false);
            setEmailData({
                to: '',
                cc: '',
                bcc: '',
                subject: '',
                body: ''
            });
        }
    }, [isOpen]);

    const loadClientEmailAndSetupData = async () => {
        if (emailLoaded) return;
        
        setLoadingClientEmail(true);
        setEmailLoaded(true);
        
        const clientName = shipment.customer || 'Cliente';
        const subclientName = shipment.subclient || '';
        const refCode = shipment.ref_code || shipment.id;
        const origin = shipment.origin_address || 'Origen no especificado';
        const destination = shipment.destination_address || 'Destino no especificado';
        const status = shipment.status || 'pendiente';
        const createdAt = shipment.created_at;
        const driverName = shipment.driver_name || 'Sin asignar';

        let clientEmail = '';
        
        try {
            // Primero intentar por client_id
            if (shipment.client_id) {
                console.log('🔍 Buscando email para client_id:', shipment.client_id);
                const clientResponse = await clientsService.getClient(shipment.client_id);
                console.log('📧 Respuesta del cliente por ID:', clientResponse);
                
                if (clientResponse && clientResponse.data && clientResponse.data.email) {
                    clientEmail = clientResponse.data.email;
                    console.log('✅ Email encontrado por ID:', clientEmail);
                }
            }

            // Si no se encontró por ID, buscar por nombre
            if (!clientEmail && clientName && clientName !== 'Cliente') {
                console.log('🔍 Buscando cliente por nombre:', clientName);
                const clientsResponse = await clientsService.getClients({ search: clientName });
                console.log('📧 Respuesta búsqueda por nombre:', clientsResponse);
                
                if (clientsResponse && clientsResponse.ok && clientsResponse.data && clientsResponse.data.length > 0) {
                    // Buscar coincidencia exacta
                    const matchingClient = clientsResponse.data.find(client => 
                        client.business_name === clientName || 
                        client.company_name === clientName ||
                        client.name === clientName ||
                        client.business_name?.includes(clientName) ||
                        clientName.includes(client.business_name)
                    );
                    
                    if (matchingClient && matchingClient.email) {
                        clientEmail = matchingClient.email;
                        console.log('✅ Email encontrado por búsqueda:', clientEmail);
                    } else if (clientsResponse.data[0] && clientsResponse.data[0].email) {
                        // Si no hay coincidencia exacta, tomar el primero
                        clientEmail = clientsResponse.data[0].email;
                        console.log('✅ Email encontrado (primer resultado):', clientEmail);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error obteniendo email del cliente:', error);
        }

        // Obtener nombre del usuario
        const userFullName = userEmail ? userEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Equipo de Logística';

        // ========== OPCIONES DE FIRMAS ==========

        // Opción 1: Firma minimalista y profesional
        const signatureMinimal = `

────────────────────────────────────────

Saludos cordiales,

${userFullName}
${companyConfig.name}

📧 ${userEmail}
📞 ${companyConfig.phone}
🌐 ${companyConfig.website}

────────────────────────────────────────
🚛 Su socio confiable en logística y transporte
📋 Este email contiene información confidencial`;

        // Opción 2: Firma con más diseño
        const signatureDesign = `

═══════════════════════════════════════

Atentamente,

${userFullName}
${companyConfig.name}
Departamento de Logística

✉️  ${userEmail}
📱  ${companyConfig.phone}  
🌍  ${companyConfig.website}

═══════════════════════════════════════
🚚 Excelencia en cada entrega
📦 Conectando destinos, creando confianza

CONFIDENCIAL: Este mensaje es únicamente para el destinatario.`;

        // Opción 3: Firma corporativa
        const signatureCorporate = `

▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪

Cordiales saludos,

${userFullName.toUpperCase()}
${companyConfig.name}
Especialistas en Logística Internacional

E-mail: ${userEmail}
Teléfono: ${companyConfig.phone}
Website: ${companyConfig.website}

▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪

🌟 COMPROMETIDOS CON LA EXCELENCIA 🌟
📦 Más de 10 años conectando el mundo

Este correo electrónico y sus anexos son CONFIDENCIALES.`;

        // Opción 4: Firma moderna con marcos
        const signatureModern = `

╔══════════════════════════════════════╗
║                                      ║
║  ${userFullName}                     ║
║  ${companyConfig.name}                ║
║                                      ║
║  📧 ${userEmail}                     ║
║  📞 ${companyConfig.phone}            ║
║  🌐 ${companyConfig.website}          ║
║                                      ║
╚══════════════════════════════════════╝

🚛 LOGÍSTICA • TRANSPORTE • CONFIANZA 🚛

⚠️ CONFIDENCIAL: Uso exclusivo del destinatario`;

        // Opción 5: Firma elegante y limpia (RECOMENDADA)
        const signatureElegant = `


──────────────────────────────────────

Con mis mejores saludos,

𝗙𝗲𝗱𝗲𝗿𝗶𝗰𝗼 𝗝𝗮𝗶𝗺𝗲
ALS Logistics
Especialista en Transporte y Logística

📧 ${userEmail}
📱 ${companyConfig.phone}
🌐 ${companyConfig.website}

──────────────────────────────────────
🚛 ${companyConfig.slogan}
📦 ${companyConfig.subSlogan}

⚠️ CONFIDENCIAL - Solo para uso del destinatario autorizado`;

        // Opción 6: Firma con logo ASCII
        const signatureWithLogo = `


    ╔═══════════════════════════════════╗
    ║         🚛 ALS LOGISTICS 📦        ║
    ╚═══════════════════════════════════╝

Atentamente,

${userFullName}
Especialista en Logística

📧 ${userEmail}
📱 ${companyConfig.phone}
🏢 ${companyConfig.address}
🌐 ${companyConfig.website}

═══════════════════════════════════════
🌟 ${companyConfig.slogan}
📦 ${companyConfig.subSlogan}

⚠️  CONFIDENCIAL: Este mensaje contiene información 
    privada destinada únicamente al receptor autorizado.`;

        // Opción 7: Firma ultra profesional
        const signatureProfessional = `


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cordialmente,

${userFullName}
${companyConfig.name}
Department of Logistics & Transportation

📧 Email: ${userEmail}
📞 Phone: ${companyConfig.phone}
🌐 Web: ${companyConfig.website}
📍 Location: ${companyConfig.address}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚛 LOGISTICS EXCELLENCE SINCE 2010
📦 "Moving your business forward"

CONFIDENTIALITY NOTICE: This email and any attachments are 
confidential and may contain privileged information.`;

        // Opción 8: Firma con estilo Miami/Moderno
        const signatureMiami = `


🌴━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🌴

Saludos desde Miami,

${userFullName}
ALS Logistics 🚛
Your Trusted Logistics Partner

📧 ${userEmail}
📱 ${companyConfig.phone}
🌐 ${companyConfig.website}
🏖️ Miami, Florida

🌴━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🌴

🚢 Connecting Americas through logistics
✈️ Air • 🚛 Land • 🚢 Sea Solutions

⚠️ Este email contiene información confidencial`;

        setEmailData({
            to: clientEmail,
            cc: '',
            bcc: '',
            subject: `Documentos del envío ${refCode}`,
            body: `Estimado/a ${clientName}${subclientName ? ` - ${subclientName}` : ''},

Adjunto encontrará los documentos correspondientes al envío:

- Código de referencia: ${refCode}
- Cliente: ${clientName}${subclientName ? ` - ${subclientName}` : ''}
- Origen: ${origin}
- Destino: ${destination}
- Estado: ${status}
- Conductor: ${driverName}
- Fecha: ${new Date(createdAt).toLocaleDateString('es-ES')}

Documentos adjuntos:
${selectedDocuments.map(doc => `• ${doc.name}`).join('\n')}

Quedamos a su disposición para cualquier consulta.${signatureElegant}` // CAMBIA AQUÍ LA FIRMA
        });

        setLoadingClientEmail(false);
        
        if (clientEmail) {
            console.log('🎉 Email del cliente configurado exitosamente:', clientEmail);
        } else {
            console.log('⚠️ No se pudo encontrar email del cliente');
        }
    };

    const handleInputChange = (field, value) => {
        setEmailData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const downloadSelectedDocuments = async () => {
        console.log('📥 Iniciando descarga de documentos:', selectedDocuments);
        
        let successCount = 0;
        const failedDocs = [];
        
        // Intentar descarga automática primero
        for (let i = 0; i < selectedDocuments.length; i++) {
            const doc = selectedDocuments[i];
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'https://codeo.site/api-als';
                const url = `${baseUrl}/${doc.file_content}`;
                
                console.log(`📥 Intentando descargar documento ${i + 1}:`, url);
                
                // Crear un link directo para descarga
                const link = document.createElement('a');
                link.href = url;
                link.download = doc.name || `documento_${doc.id}.pdf`;
                link.target = '_blank';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log(`✅ Descarga iniciada: ${doc.name}`);
                successCount++;
                
                // Pequeña pausa entre descargas
                await new Promise(resolve => setTimeout(resolve, 800));
                
            } catch (error) {
                console.error(`❌ Error descargando ${doc.name}:`, error);
                failedDocs.push(doc);
            }
        }
        
        // Si alguna descarga falló, abrir las pestañas como respaldo
        if (failedDocs.length > 0) {
            console.log('📂 Abriendo pestañas para documentos que fallaron:', failedDocs);
            
            failedDocs.forEach((doc, index) => {
                const baseUrl = import.meta.env.VITE_API_URL || 'https://codeo.site/api-als';
                const url = `${baseUrl}/${doc.file_content}`;
                
                setTimeout(() => {
                    window.open(url, '_blank');
                }, index * 500);
            });
            
            setTimeout(() => {
                alert(`✅ Se iniciaron ${successCount} descargas automáticas.\n📂 Se abrieron ${failedDocs.length} pestañas adicionales.\n\nPor favor descarga manualmente los archivos de las pestañas abiertas.`);
            }, 2000);
        } else {
            setTimeout(() => {
                alert(`✅ Se iniciaron todas las descargas automáticamente (${successCount} documentos).\n\nRevisa tu carpeta de descargas.`);
            }, 1000);
        }
        
        console.log(`📊 Descarga completada: ${successCount} automáticas, ${failedDocs.length} manuales`);
        
        return successCount + failedDocs.length;
    };

    const handleSend = async () => {
        if (!emailData.to.trim()) {
            alert('Por favor, ingrese un destinatario');
            return;
        }

        if (selectedDocuments.length === 0) {
            alert('No hay documentos seleccionados para adjuntar');
            return;
        }

        setIsSending(true);
        
        try {
            alert('Los documentos se van a descargar automáticamente. Por favor, adjúntelos manualmente en su cliente de email.');
            
            const downloadedCount = await downloadSelectedDocuments();
            
            if (downloadedCount === 0) {
                alert('No se pudo descargar ningún documento. Verifique su conexión e inténtelo nuevamente.');
                setIsSending(false);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const subject = encodeURIComponent(emailData.subject);
            const body = encodeURIComponent(emailData.body);
            const to = encodeURIComponent(emailData.to);
            const cc = emailData.cc ? encodeURIComponent(emailData.cc) : '';
            const bcc = emailData.bcc ? encodeURIComponent(emailData.bcc) : '';
            
            let mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;
            
            if (cc) {
                mailtoUrl += `&cc=${cc}`;
            }
            
            if (bcc) {
                mailtoUrl += `&bcc=${bcc}`;
            }
            
            window.open(mailtoUrl, '_blank');
            
            setTimeout(() => {
                alert(`Se abrió su cliente de email con el mensaje preparado.\n\nPor favor:\n1. Adjunte manualmente los ${downloadedCount} archivos descargados\n2. Verifique el contenido del mensaje\n3. Envíe el email`);
            }, 1000);
            
            setTimeout(() => {
                onClose();
                setIsSending(false);
            }, 2000);
            
        } catch (error) {
            console.error('Error al preparar email:', error);
            alert('Error al preparar el email. Por favor, inténtelo de nuevo.');
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-6 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Mail className="w-6 h-6" />
                        <h2 className="text-xl font-semibold">Componer Email</h2>
                        {loadingClientEmail && (
                            <Loader className="w-4 h-4 animate-spin ml-2" />
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Con scroll */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Información del envío */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">Información del Envío</h3>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p><span className="font-medium">Código:</span> {shipment.ref_code || shipment.id}</p>
                            <p><span className="font-medium">Cliente:</span> {shipment.customer}{shipment.subclient && ` - ${shipment.subclient}`}</p>
                            <p><span className="font-medium">Conductor:</span> {shipment.driver_name}</p>
                            <p><span className="font-medium">Estado:</span> {shipment.status}</p>
                        </div>
                    </div>

                    {/* Estado del email */}
                    {!loadingClientEmail && emailLoaded && (
                        <div className={`mb-6 p-4 rounded-lg border ${
                            emailData.to 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-orange-50 border-orange-200'
                        }`}>
                            <h3 className={`font-medium mb-2 ${
                                emailData.to ? 'text-green-800' : 'text-orange-800'
                            }`}>
                                {emailData.to ? '✅ Email encontrado' : '⚠️ Email no encontrado'}
                            </h3>
                            <p className={`text-sm ${
                                emailData.to ? 'text-green-700' : 'text-orange-700'
                            }`}>
                                {emailData.to 
                                    ? `Se encontró automáticamente: ${emailData.to}`
                                    : 'No se pudo encontrar el email del cliente automáticamente. Por favor, ingréselo manualmente.'
                                }
                            </p>
                        </div>
                    )}

                    {/* Documentos seleccionados */}
                    {selectedDocuments.length > 0 && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                Documentos que se descargarán ({selectedDocuments.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedDocuments.map((doc, index) => (
                                    <div key={doc.id || index} className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded border">
                                        <Paperclip className="w-3 h-3" />
                                        <span className="truncate">{doc.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Formulario de email */}
                    <div className="space-y-4">
                        {/* Para */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                Para *
                                {loadingClientEmail && (
                                    <span className="text-xs text-blue-600 flex items-center gap-1">
                                        <Loader className="w-3 h-3 animate-spin" />
                                        Buscando...
                                    </span>
                                )}
                            </label>
                            <input
                                type="email"
                                value={emailData.to}
                                onChange={(e) => handleInputChange('to', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={loadingClientEmail ? "Buscando email del cliente..." : "destinatario@email.com"}
                                required
                                disabled={loadingClientEmail}
                            />
                        </div>

                        {/* CC */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CC (Copia)
                            </label>
                            <input
                                type="email"
                                value={emailData.cc}
                                onChange={(e) => handleInputChange('cc', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="copia@email.com"
                            />
                        </div>

                        {/* BCC */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                BCC (Copia oculta)
                            </label>
                            <input
                                type="email"
                                value={emailData.bcc}
                                onChange={(e) => handleInputChange('bcc', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="copia.oculta@email.com"
                            />
                        </div>

                        {/* Asunto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Asunto *
                            </label>
                            <input
                                type="text"
                                value={emailData.subject}
                                onChange={(e) => handleInputChange('subject', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Asunto del email"
                                required
                            />
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensaje *
                            </label>
                            <textarea
                                value={emailData.body}
                                onChange={(e) => handleInputChange('body', e.target.value)}
                                rows={12}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                placeholder="Escriba su mensaje aquí..."
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Footer - Siempre visible */}
                <div className="border-t p-6 bg-gray-50 flex justify-between items-center flex-shrink-0">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">{selectedDocuments.length}</span> documento(s) seleccionado(s)
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={isSending || loadingClientEmail || !emailData.to.trim() || !emailData.subject.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {isSending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Preparando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Abrir Email
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailComposeModal;