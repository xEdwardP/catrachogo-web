import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AccountSwitchHeader } from '../components/AccountSwitchHeader';
import { CloudinaryFileInput } from '../components/CloudinaryFileInput';
import { completeDriverProfile } from '../api/drivers';
import { isCloudinaryConfigured } from '../api/cloudinary';
import { translateCompleteDriverProfileError } from '../api/driverErrorMessages';
import type { VehicleType } from '../types/driver';

export function DriverCompleteProfilePage() {
  const navigate = useNavigate();

  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');

  const [idFrontUrl, setIdFrontUrl] = useState<string | null>(null);
  const [idBackUrl, setIdBackUrl] = useState<string | null>(null);
  const [vehicleRegistrationUrl, setVehicleRegistrationUrl] = useState<string | null>(null);
  const [selfieWithIdUrl, setSelfieWithIdUrl] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const allDocumentsUploaded =
    idFrontUrl && idBackUrl && vehicleRegistrationUrl && selfieWithIdUrl && profilePhotoUrl;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!allDocumentsUploaded) {
      toast.error('Sube los 4 documentos y tu foto de perfil para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeDriverProfile({
        vehicleType,
        licenseNumber,
        vehicle: { brand, model, year: Number(year), color, plate },
        idFrontUrl,
        idBackUrl,
        vehicleRegistrationUrl,
        selfieWithIdUrl,
        profilePhotoUrl,
      });
      toast.success('Perfil de conductor completado. Un administrador revisará tus documentos.');
      navigate('/driver', { replace: true });
    } catch (error) {
      toast.error(translateCompleteDriverProfileError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="mx-auto max-w-md">
        <AccountSwitchHeader />
        <h1 className="mb-1 text-xl font-bold text-gray-800">Completa tu perfil de conductor</h1>
        <p className="mb-4 text-sm text-gray-600">
          Necesitamos estos datos y documentos para verificar tu cuenta antes de que puedas
          recibir viajes.
        </p>

        {!isCloudinaryConfigured() && (
          <div className="mb-4 rounded-lg bg-yellow-100 p-3 text-sm text-yellow-800">
            Falta configurar Cloudinary (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET).
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-gray-700">Datos del vehículo</p>

            <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setVehicleType('car')}
                className={`rounded-lg py-2 text-sm font-medium transition ${
                  vehicleType === 'car' ? 'bg-brand text-white shadow' : 'text-gray-600'
                }`}
              >
                Carro
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('motorcycle')}
                className={`rounded-lg py-2 text-sm font-medium transition ${
                  vehicleType === 'motorcycle' ? 'bg-brand text-white shadow' : 'text-gray-600'
                }`}
              >
                Motocicleta
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="licenseNumber" className="mb-1 block text-sm font-medium text-gray-700">
                  Número de licencia
                </label>
                <input
                  id="licenseNumber"
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(event) => setLicenseNumber(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="brand" className="mb-1 block text-sm font-medium text-gray-700">
                    Marca
                  </label>
                  <input
                    id="brand"
                    type="text"
                    required
                    value={brand}
                    onChange={(event) => setBrand(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label htmlFor="model" className="mb-1 block text-sm font-medium text-gray-700">
                    Modelo
                  </label>
                  <input
                    id="model"
                    type="text"
                    required
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="year" className="mb-1 block text-sm font-medium text-gray-700">
                    Año
                  </label>
                  <input
                    id="year"
                    type="number"
                    required
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label htmlFor="color" className="mb-1 block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <input
                    id="color"
                    type="text"
                    required
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label htmlFor="plate" className="mb-1 block text-sm font-medium text-gray-700">
                    Placa
                  </label>
                  <input
                    id="plate"
                    type="text"
                    required
                    value={plate}
                    onChange={(event) => setPlate(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-gray-700">Documentos y foto</p>
            <div className="flex flex-col gap-3">
              <CloudinaryFileInput
                id="idFrontUrl"
                label="Identidad (frente)"
                value={idFrontUrl}
                onUploaded={setIdFrontUrl}
              />
              <CloudinaryFileInput
                id="idBackUrl"
                label="Identidad (reverso)"
                value={idBackUrl}
                onUploaded={setIdBackUrl}
              />
              <CloudinaryFileInput
                id="vehicleRegistrationUrl"
                label="Tarjeta de circulación"
                value={vehicleRegistrationUrl}
                onUploaded={setVehicleRegistrationUrl}
              />
              <CloudinaryFileInput
                id="selfieWithIdUrl"
                label="Selfie con tu identidad"
                value={selfieWithIdUrl}
                onUploaded={setSelfieWithIdUrl}
              />
              <CloudinaryFileInput
                id="profilePhotoUrl"
                label="Foto de perfil"
                value={profilePhotoUrl}
                onUploaded={setProfilePhotoUrl}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar para revisión'}
          </button>
        </form>
      </div>
    </div>
  );
}
