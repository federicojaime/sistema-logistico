// src/components/shipment-creation/ShipmentCreationForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, AlertCircle, Save } from 'lucide-react';
import { useShipments } from '../../contexts/ShipmentsContext';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import api from '../../services/api';

// Importar subcomponentes
import StepsProgress from './components/StepsProgress';
import MobileStepNav from './components/MobileStepNav';
import ClientSelector from './components/ClientSelector';
import AddressStep from './components/AddressStep';
import ItemsStep from './components/ItemsStep';
import ServicesStep from './components/ServicesStep';
import DocumentsStep from './components/DocumentsStep';

// Estado inicial del envío
const INITIAL_SHIPMENT = {
    refCode: '',
    cliente: '',
    clientId: null,
    subCliente: '',
    subClientId: null,
    direccionOrigen: '',
    latitudOrigen: '',
    longitudOrigen: '',
    direccionDestino: '',
    latitudDestino: '',
    longitudDestino: '',
    items: [],
    costoEnvio: 1,
    status: 'pendiente',
    fechaCreacion: new Date().toISOString(),
    pdfs: [],
    transportistaId: '',
    liftGate: 'NO',
    appointment: 'NO',
    palletJack: 'NO',
    comments: '',
    servicePrices: {
        liftGate: 15,
        appointment: 15,
        palletJack: 15
    }
};

const ShipmentCreationForm = () => {
    const navigate = useNavigate();
    const { addShipment } = useShipments();

    // Estados
    const [shipment, setShipment] = useState(INITIAL_SHIPMENT);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [transportistas, setTransportistas] = useState([]);
    const [loadingTransportistas, setLoadingTransportistas] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedSubClient, setSelectedSubClient] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Pasos del formulario
    const steps = [
        { id: 'cliente', label: 'Cliente' },
        { id: 'direcciones', label: 'Direcciones' },
        { id: 'items', label: 'Items' },
        { id: 'servicios', label: 'Servicios' },
        { id: 'documentos', label: 'Documentos' }
    ];

    // Cargar transportistas con autenticación
    useEffect(() => {
        const cargarTransportistas = async () => {
            try {
                setLoadingTransportistas(true);

                // Primero obtenemos todos los envíos
                const enviosResponse = await api.get('/shipments');
                const envios = Array.isArray(enviosResponse) ? enviosResponse :
                    (enviosResponse?.data && Array.isArray(enviosResponse.data) ? enviosResponse.data : []);

                // Luego obtenemos los usuarios (transportistas)
                const usersResponse = await api.get('/users');
                const usersData = Array.isArray(usersResponse) ? usersResponse :
                    (usersResponse?.data && Array.isArray(usersResponse.data) ? usersResponse.data : []);

                // Filtramos para quedarnos solo con transportistas y calculamos los envíos pendientes
                let transportistasData = usersData
                    .filter((user) => user.role === 'transportista')
                    .map((transportista) => {
                        // Contar los envíos pendientes para este transportista
                        const enviosPendientes = envios.filter(
                            (envio) =>
                                envio.driver_id === transportista.id &&
                                envio.status === 'pendiente'
                        ).length;

                        return {
                            ...transportista,
                            enviosPendientes,
                            name: `${transportista.firstname} ${transportista.lastname}`,
                            displayName: `${transportista.firstname} ${transportista.lastname} (${enviosPendientes} envíos pendientes)`,
                        };
                    });

                // Ordenar transportistas por cantidad de envíos pendientes (de menor a mayor)
                transportistasData = transportistasData.sort((a, b) =>
                    a.enviosPendientes - b.enviosPendientes
                );

                console.log('Transportistas cargados con envíos pendientes:', transportistasData);
                setTransportistas(transportistasData);
            } catch (error) {
                console.error('Error al cargar transportistas:', error);
                setTransportistas([]);
            } finally {
                setLoadingTransportistas(false);
            }
        };

        cargarTransportistas();
    }, []);

    // Manejar cambios en campos generales
    const handleChange = useCallback((field, value) => {
        // Limpiar errores cuando el usuario modifica un campo
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }

        setShipment(prev => ({
            ...prev,
            [field]: value
        }));
    }, [errors]);

    // Manejar selección de cliente
    const handleSelectClient = (client) => {
        if (typeof client === 'object' && client !== null) {
            setSelectedClient(client);
            setShipment(prev => ({
                ...prev,
                cliente: client.business_name || client.name,
                clientId: client.id,
                // Al cambiar el cliente principal, resetear el sub cliente
                subCliente: '',
                subClientId: null
            }));
            setSelectedSubClient(null);
            setErrors(prev => ({ ...prev, cliente: undefined }));
        } else {
            setShipment(prev => ({
                ...prev,
                cliente: client,
                clientId: null, // Asegurar que se limpie el ID si solo hay texto
                // Si se borra el cliente, también borrar el sub cliente
                subCliente: '',
                subClientId: null
            }));
            setSelectedClient(null);
            setSelectedSubClient(null);
            if (client) {
                setErrors(prev => ({ ...prev, cliente: undefined }));
            }
        }
    };

    // Manejar selección de sub cliente
    const handleSelectSubClient = (subClientName, subClientId) => {
        setShipment(prev => ({
            ...prev,
            subCliente: subClientName,
            subClientId: subClientId
        }));

        if (subClientId) {
            setSelectedSubClient({
                id: subClientId,
                name: subClientName
            });
        } else {
            // Si solo hay texto (entrada manual), mantener el subCliente pero sin ID
            setSelectedSubClient(null);
        }
    };

    // Validación del formulario
    const validateForm = () => {
        const newErrors = {};

        if (!shipment.refCode.trim()) newErrors.refCode = 'El código de referencia es requerido';
        if (!shipment.cliente.trim()) newErrors.cliente = 'El cliente es requerido';
        if (!shipment.direccionOrigen.trim()) newErrors.direccionOrigen = 'La dirección de origen es requerida';
        if (!shipment.direccionDestino.trim()) newErrors.direccionDestino = 'La dirección de destino es requerida';
        if (!shipment.transportistaId) newErrors.transportistaId = 'Debe seleccionar un transportista';

        // Verificar si hay ítems (regulares o servicios)
        const hasRegularItems = shipment.items.length > 0;
        const hasServiceItems =
            shipment.liftGate === 'YES' ||
            shipment.appointment === 'YES' ||
            shipment.palletJack === 'YES';

        if (!hasRegularItems && !hasServiceItems) {
            newErrors.items = 'Debe agregar al menos un item o seleccionar algún servicio adicional';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // Mostrar mensaje de error
            setErrors(prev => ({
                ...prev,
                submit: 'Por favor, corrija los errores antes de enviar el formulario.'
            }));
            return;
        }

        setIsSubmitting(true);

        try {
            // Crear FormData para enviar archivos
            const formData = new FormData();

            // Agregar campos principales
            formData.append('ref_code', shipment.refCode);
            formData.append('customer', shipment.cliente);
            formData.append('origin_address', shipment.direccionOrigen);
            formData.append('origin_lat', shipment.latitudOrigen);
            formData.append('origin_lng', shipment.longitudOrigen);
            formData.append('destination_address', shipment.direccionDestino);
            formData.append('destination_lat', shipment.latitudDestino);
            formData.append('destination_lng', shipment.longitudDestino);
            formData.append('shipping_cost', shipment.costoEnvio.toString());
            formData.append('driver_id', shipment.transportistaId);
            formData.append('status', shipment.status);
            formData.append('lift_gate', shipment.liftGate);
            formData.append('appointment', shipment.appointment);
            formData.append('pallet_jack', shipment.palletJack);
            formData.append('comments', shipment.comments);

            // Si hay un cliente seleccionado, incluir su ID
            if (selectedClient && selectedClient.id) {
                formData.append('client_id', selectedClient.id);
            }

            // Si hay un sub cliente seleccionado, incluir su ID
            if (selectedSubClient && selectedSubClient.id) {
                formData.append('subclient_id', selectedSubClient.id);
            }

            // Siempre incluir el texto del subcliente si existe (sea seleccionado o manual)
            if (shipment.subCliente) {
                formData.append('subclient', shipment.subCliente);
            }

            // Transformar items para el backend
            const itemsForBackend = shipment.items.map(item => ({
                description: item.descripcion,
                quantity: item.cantidad,
                weight: item.pesoTotal,
                value: item.valorTotal
            }));

            // Agregar servicios como ítems si están activos
            if (shipment.liftGate === 'YES') {
                itemsForBackend.push({
                    description: 'Servicio: Lift Gate',
                    quantity: 1,
                    weight: 0,
                    value: parseFloat(shipment.servicePrices.liftGate) || 0
                });
            }

            if (shipment.appointment === 'YES') {
                itemsForBackend.push({
                    description: 'Servicio: Appointment',
                    quantity: 1,
                    weight: 0,
                    value: parseFloat(shipment.servicePrices.appointment) || 0
                });
            }

            if (shipment.palletJack === 'YES') {
                itemsForBackend.push({
                    description: 'Servicio: Pallet Jack',
                    quantity: 1,
                    weight: 0,
                    value: parseFloat(shipment.servicePrices.palletJack) || 0
                });
            }

            formData.append('items', JSON.stringify(itemsForBackend));

            // Agregar los archivos PDF
            shipment.pdfs.forEach(file => {
                formData.append('documents[]', file);
            });

            const success = await addShipment(formData);

            if (success) {
                setShowSuccess(true);
                setTimeout(() => {
                    navigate('/logistica/home');
                }, 2000);
            } else {
                throw new Error('Error al crear el envío');
            }
        } catch (error) {
            console.error('Error al crear envío:', error);
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Error al crear el envío'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Avanzar al siguiente paso
    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            // Scroll al inicio de la página
            window.scrollTo(0, 0);
        }
    };

    // Retroceder al paso anterior
    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            // Scroll al inicio de la página
            window.scrollTo(0, 0);
        }
    };

    // Comprobar si se puede avanzar
    const canProceed = () => {
        switch (currentStep) {
            case 0: // Cliente
                return shipment.cliente.trim() !== '' && shipment.refCode.trim() !== '';
            case 1: // Direcciones
                return shipment.direccionOrigen.trim() !== '' && shipment.direccionDestino.trim() !== '';
            case 2: // Items
                // Se puede avanzar si hay ítems o si hay servicios seleccionados
                return shipment.items.length > 0 ||
                    shipment.liftGate === 'YES' ||
                    shipment.appointment === 'YES' ||
                    shipment.palletJack === 'YES';
            case 3: // Servicios
                return shipment.transportistaId !== ''; // Requiere seleccionar transportista
            default:
                return true;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header con título y botones */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/logistica/home')}
                                className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 mr-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center">
                                <Package className="w-6 h-6 text-blue-600 mr-2" />
                                Crear Nuevo Envío
                            </h1>
                        </div>

                        {/* Botón de guardar (visible solo en el último paso) */}
                        {currentStep === steps.length - 1 && (
                            <button
                                type="button" // Cambiado de "submit" a "button"
                                onClick={handleSubmit} // Agregar onClick
                                className={`px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {isSubmitting ? 'Creando...' : 'Crear Envío'}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Alertas de éxito o error */}
                {showSuccess && (
                    <div className="mb-6">
                        <Alert className="bg-green-50 border-green-500">
                            <AlertTitle className="text-green-800 font-semibold">
                                ¡Éxito!
                            </AlertTitle>
                            <AlertDescription className="text-green-700">
                                El envío ha sido creado correctamente. Redirigiendo...
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {errors.submit && (
                    <div className="mb-6">
                        <Alert className="bg-red-50 border-red-500">
                            <AlertTitle className="text-red-800 font-semibold">Error</AlertTitle>
                            <AlertDescription className="text-red-700">
                                {errors.submit}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar con pasos (visible en pantallas grandes) */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="bg-white p-5 rounded-xl shadow-sm sticky top-20">
                            <h2 className="text-lg font-medium text-gray-800 mb-6">Pasos</h2>

                            <div className="space-y-2">
                                {steps.map((step, index) => {
                                    const isActive = index === currentStep;
                                    const isCompleted = index < currentStep;

                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => setCurrentStep(index)}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${isActive
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : isCompleted
                                                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div
                                                className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${isActive
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : isCompleted
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                    }`}
                                            >
                                                {index + 1}
                                            </div>
                                            {step.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="lg:col-span-9">
                        {/* Indicador de progreso (desktop) */}
                        <div className="hidden md:block lg:hidden mb-6">
                            <StepsProgress steps={steps} currentStep={currentStep} />
                        </div>

                        {/* Navegación de pasos (mobile) */}
                        <div className="md:hidden mb-6">
                            <MobileStepNav
                                steps={steps}
                                currentStep={currentStep}
                                setCurrentStep={setCurrentStep}
                            />
                        </div>

                        {/* Formulario principal */}
                        <form id="shipmentForm" onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            {/* Contenido dinámico según el paso actual */}
                            <div className="animate-fadeIn">
                                {currentStep === 0 && (
                                    <ClientSelector
                                        shipment={shipment}
                                        handleChange={handleChange}
                                        handleSelectClient={handleSelectClient}
                                        handleSelectSubClient={handleSelectSubClient}
                                        errors={errors}
                                    />
                                )}

                                {currentStep === 1 && (
                                    <AddressStep
                                        shipment={shipment}
                                        handleChange={handleChange}
                                        errors={errors}
                                    />
                                )}

                                {currentStep === 2 && (
                                    <ItemsStep
                                        shipment={shipment}
                                        setShipment={setShipment}
                                        errors={errors}
                                        setErrors={setErrors}
                                    />
                                )}

                                {currentStep === 3 && (
                                    <ServicesStep
                                        shipment={shipment}
                                        handleChange={handleChange}
                                        transportistas={transportistas}
                                        loadingTransportistas={loadingTransportistas}
                                        errors={errors}
                                    />
                                )}

                                {currentStep === 4 && (
                                    <DocumentsStep
                                        shipment={shipment}
                                        setShipment={setShipment}
                                    />
                                )}
                            </div>

                            {/* Botones de navegación */}
                            <div className="flex justify-between pt-4 border-t mt-8">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className={`px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={currentStep === 0}
                                >
                                    Anterior
                                </button>

                                {currentStep < steps.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className={`px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors ${!canProceed() ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        disabled={!canProceed()}
                                    >
                                        Siguiente
                                    </button>
                                ) : (
                                    <button
                                        type="button" // Cambiado de "submit" a "button"
                                        onClick={handleSubmit} // Usar onClick en lugar de type="submit"
                                        className={`px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Creando...
                                            </>
                                        ) : (
                                            'Crear Envío'
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipmentCreationForm;