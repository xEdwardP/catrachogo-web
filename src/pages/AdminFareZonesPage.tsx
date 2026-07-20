import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { createFareZone, getFareZones, updateFareZone } from '../api/fareZones';
import { translateFareZoneError } from '../api/adminErrorMessages';
import type { FareZone } from '../types/fareZone';

interface FareZoneFormState {
  zoneName: string;
  baseFare: string;
  farePerKm: string;
  centerLat: string;
  centerLng: string;
}

const EMPTY_FORM: FareZoneFormState = {
  zoneName: '',
  baseFare: '',
  farePerKm: '',
  centerLat: '',
  centerLng: '',
};

export function AdminFareZonesPage() {
  const [zones, setZones] = useState<FareZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingZoneId, setEditingZoneId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<FareZoneFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  function fetchZones() {
    getFareZones()
      .then(setZones)
      .catch(() => toast.error('No se pudieron cargar las zonas.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchZones();
  }, []);

  function openNewZoneForm() {
    setForm(EMPTY_FORM);
    setEditingZoneId('new');
  }

  function openEditForm(zone: FareZone) {
    setForm({
      zoneName: zone.zoneName,
      baseFare: String(zone.baseFare),
      farePerKm: String(zone.farePerKm),
      centerLat: String(zone.centerLat),
      centerLng: String(zone.centerLng),
    });
    setEditingZoneId(zone.id);
  }

  function closeForm() {
    setEditingZoneId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      zoneName: form.zoneName,
      baseFare: Number(form.baseFare),
      farePerKm: Number(form.farePerKm),
      centerLat: Number(form.centerLat),
      centerLng: Number(form.centerLng),
    };

    setIsSaving(true);
    try {
      if (editingZoneId === 'new') {
        await createFareZone(payload);
        toast.success('Zona creada.');
      } else if (editingZoneId) {
        await updateFareZone(editingZoneId, payload);
        toast.success('Zona actualizada.');
      }
      setEditingZoneId(null);
      setIsLoading(true);
      fetchZones();
    } catch (error) {
      toast.error(translateFareZoneError(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-800">Zonas y tarifas</h1>
          <p className="text-sm text-gray-500">
            {isLoading ? 'Cargando...' : `${zones.length} zonas configuradas`}
          </p>
        </div>
        <button
          type="button"
          onClick={openNewZoneForm}
          className="flex items-center gap-2 rounded-lg bg-[#E8532E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d1471f]"
        >
          <Plus className="h-4 w-4" />
          Nueva zona
        </button>
      </div>

      {editingZoneId && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-gray-700">
              {editingZoneId === 'new' ? 'Nueva zona' : 'Editar zona'}
            </p>
            <button type="button" onClick={closeForm} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label htmlFor="zoneName" className="mb-1 block text-xs font-medium text-gray-600">
                Nombre
              </label>
              <input
                id="zoneName"
                type="text"
                required
                value={form.zoneName}
                onChange={(event) => setForm({ ...form, zoneName: event.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E8532E] focus:outline-none focus:ring-1 focus:ring-[#E8532E]"
              />
            </div>
            <div>
              <label htmlFor="baseFare" className="mb-1 block text-xs font-medium text-gray-600">
                Tarifa base (L.)
              </label>
              <input
                id="baseFare"
                type="number"
                step="0.01"
                required
                value={form.baseFare}
                onChange={(event) => setForm({ ...form, baseFare: event.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E8532E] focus:outline-none focus:ring-1 focus:ring-[#E8532E]"
              />
            </div>
            <div>
              <label htmlFor="farePerKm" className="mb-1 block text-xs font-medium text-gray-600">
                Tarifa por km (L.)
              </label>
              <input
                id="farePerKm"
                type="number"
                step="0.01"
                required
                value={form.farePerKm}
                onChange={(event) => setForm({ ...form, farePerKm: event.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E8532E] focus:outline-none focus:ring-1 focus:ring-[#E8532E]"
              />
            </div>
            <div>
              <label htmlFor="centerLat" className="mb-1 block text-xs font-medium text-gray-600">
                Centro (lat)
              </label>
              <input
                id="centerLat"
                type="number"
                step="0.000001"
                required
                value={form.centerLat}
                onChange={(event) => setForm({ ...form, centerLat: event.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E8532E] focus:outline-none focus:ring-1 focus:ring-[#E8532E]"
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label htmlFor="centerLng" className="mb-1 block text-xs font-medium text-gray-600">
                Centro (lng)
              </label>
              <input
                id="centerLng"
                type="number"
                step="0.000001"
                required
                value={form.centerLng}
                onChange={(event) => setForm({ ...form, centerLng: event.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E8532E] focus:outline-none focus:ring-1 focus:ring-[#E8532E]"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-[#E8532E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Tarifa base</th>
              <th className="px-5 py-3">Tarifa por km</th>
              <th className="px-5 py-3">Centro</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && zones.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                  Todavía no hay zonas configuradas.
                </td>
              </tr>
            )}
            {!isLoading && zones.map((zone) => (
              <tr
                key={zone.id}
                onClick={() => openEditForm(zone)}
                className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50"
              >
                <td className="px-5 py-3 font-medium text-gray-800">{zone.zoneName}</td>
                <td className="px-5 py-3 text-gray-600">L. {zone.baseFare.toFixed(2)}</td>
                <td className="px-5 py-3 text-gray-600">L. {zone.farePerKm.toFixed(2)}</td>
                <td className="px-5 py-3 text-gray-600">
                  {zone.centerLat.toFixed(4)}, {zone.centerLng.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
