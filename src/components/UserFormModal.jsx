// src/components/UserFormModal.jsx
import React, { useEffect } from 'react';
import { X, Save, Users } from 'lucide-react';

const UserFormModal = ({ 
  showModal, 
  setShowModal, 
  editingUser, 
  formData, 
  setFormData, 
  handleSubmit, 
  loading, 
  errors,
  setFormErrors // Añadimos el prop setFormErrors para poder limpiar los errores
}) => {
  // Función para traducir los mensajes de error
  const translateErrorMessage = (errorMessage) => {
    if (!errorMessage) return '';
    
    // Reemplazar los mensajes específicos
    let translatedMessage = errorMessage;
    
    translatedMessage = translatedMessage.replace('firstname debe tener al menos 3 caracteres', 'El nombre debe tener al menos 3 caracteres');
    translatedMessage = translatedMessage.replace('lastname debe tener al menos 3 caracteres', 'El apellido debe tener al menos 3 caracteres');
    
    return translatedMessage;
  };
  
  // Función para cerrar el modal y limpiar errores
  const handleCloseModal = () => {
    setShowModal(false);
    // Limpiamos los errores al cerrar el modal
    if (setFormErrors) {
      setFormErrors({});
    }
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              <Users className="w-5 h-5 text-blue-600" />
            </h3>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editingUser}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingUser && <span className="text-xs text-gray-500">(Dejar en blanco para mantener la actual)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingUser}
                  minLength={6}
                />
                {!editingUser && (
                  <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="transportista">Transportista</option>
                  <option value="contable">Contable</option>
                  <option value="admin">Administrativo</option>
                </select>
              </div>
            </div>
            
            {/* Mostrar errores */}
            {errors && typeof errors === 'string' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {translateErrorMessage(errors)}
              </div>
            )}
            
            {errors && typeof errors === 'object' && Object.keys(errors).length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {translateErrorMessage(
                  errors.errorMessage || 
                  Object.entries(errors)
                    .filter(([key]) => key !== 'errorMessage' && key !== 'general')
                    .map(([key, value]) => value)
                    .join('. ')
                )}
              </div>
            )}
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default UserFormModal;