// src/components/CameraPODCapture.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, RotateCcw, Upload } from 'lucide-react';
import { jsPDF } from 'jspdf';

/**
 * Componente para capturar fotos desde la cámara y convertirlas a PDF
 */
const CameraPODCapture = ({ onCapture, onClose, shipmentId }) => {
    const [capturing, setCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [converting, setConverting] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Iniciar la cámara cuando se active el componente
    useEffect(() => {
        if (capturing) {
            startCamera();
        } else {
            stopCamera();
        }

        // Limpiar al desmontar
        return () => {
            stopCamera();
        };
    }, [capturing]);

    // Iniciar acceso a la cámara
    const startCamera = async () => {
        try {
            setError(null);
            const constraints = {
                video: {
                    facingMode: 'environment', // Usar cámara trasera por defecto
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('No se pudo acceder a la cámara. Verifica los permisos.');
            setCapturing(false);
        }
    };

    // Detener la cámara
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    // Tomar foto
    const takePicture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Configurar el canvas con las dimensiones del video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Dibujar el frame actual del video en el canvas
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convertir a URL de datos para previsualización
            const imageDataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageDataUrl);
            setCapturing(false);

        } catch (err) {
            console.error('Error capturing image:', err);
            setError('Error al capturar la imagen.');
        }
    };

    // Convertir imagen a PDF y enviarla
    const processAndUpload = async () => {
        if (!capturedImage) return;

        try {
            setConverting(true);

            // Crear el documento PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Cargar la imagen como objeto Image
            const img = new Image();
            img.src = capturedImage;

            // Esperar a que la imagen cargue
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            // Calcular dimensiones para ajustar la imagen al PDF manteniendo proporciones
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgRatio = img.height / img.width;
            const pdfRatio = pageHeight / pageWidth;

            let imgWidth, imgHeight;

            if (imgRatio > pdfRatio) {
                // Imagen más alta que ancha en proporción al PDF
                imgHeight = pageHeight - 20; // margen
                imgWidth = imgHeight / imgRatio;
            } else {
                // Imagen más ancha que alta en proporción al PDF
                imgWidth = pageWidth - 20; // margen
                imgHeight = imgWidth * imgRatio;
            }

            // Añadir la imagen centrada
            const xPos = (pageWidth - imgWidth) / 2;
            const yPos = (pageHeight - imgHeight) / 2;

            pdf.addImage(capturedImage, 'JPEG', xPos, yPos, imgWidth, imgHeight);

            // Añadir información del envío
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            const timestamp = new Date().toLocaleString();
            pdf.text(`POD para envío #${shipmentId} - Capturado: ${timestamp}`, 10, 10);

            // Convertir a blob
            const pdfBlob = pdf.output('blob');

            // Crear archivo para enviar
            const pdfFile = new File([pdfBlob], `pod_envio_${shipmentId}_${Date.now()}.pdf`, {
                type: 'application/pdf'
            });

            // Enviar al padre
            onCapture(pdfFile);

        } catch (err) {
            console.error('Error converting to PDF:', err);
            setError('Error al convertir la imagen a PDF.');
        } finally {
            setConverting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-xl w-full overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">Capturar Foto POD</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="relative aspect-video bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden mb-4">
                        {!capturing && !capturedImage ? (
                            <div className="text-center p-8">
                                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Haga clic en "Activar cámara" para comenzar</p>
                            </div>
                        ) : capturedImage ? (
                            <img
                                src={capturedImage}
                                alt="Imagen capturada"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Canvas oculto para procesamiento de imagen */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div className="flex justify-center space-x-4">
                        {!capturing && !capturedImage ? (
                            <button
                                onClick={() => setCapturing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <Camera className="w-5 h-5 mr-2" />
                                Activar cámara
                            </button>
                        ) : capturing ? (
                            <button
                                onClick={takePicture}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                            >
                                <Check className="w-5 h-5 mr-2" />
                                Capturar
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setCapturedImage(null);
                                        setCapturing(true);
                                    }}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                                >
                                    <RotateCcw className="w-5 h-5 mr-2" />
                                    Volver a capturar
                                </button>

                                <button
                                    onClick={processAndUpload}
                                    disabled={converting}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                                >
                                    {converting ? (
                                        <>
                                            <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 mr-2" />
                                            Convertir y subir
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraPODCapture;