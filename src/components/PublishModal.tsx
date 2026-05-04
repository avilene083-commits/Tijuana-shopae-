import React, { useState } from 'react'
import { X, Plus, Trash2, MapPin, Loader } from 'lucide-react'
import { useLocation } from '../hooks'
import { useStore } from '../store'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  onPublish: (data: any) => Promise<void>
}

const CATEGORIES = [
  'Electrónica',
  'Ropa',
  'Muebles',
  'Deportes',
  'Libros',
  'Servicios',
]

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onPublish,
}) => {
  const { location, getLocation } = useLocation()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const { setLoading: setStoreLoading } = useStore()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: CATEGORIES[0],
  })

  const handleGetLocation = async () => {
    setStoreLoading(true)
    try {
      await getLocation()
    } catch (error) {
      alert('No pudimos obtener tu ubicación. Intenta de nuevo.')
    } finally {
      setStoreLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - images.length)
      setImages([...images, ...newFiles])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!location) {
      alert('Debes permitir el acceso a tu ubicación para publicar')
      return
    }

    if (!formData.title || !formData.price) {
      alert('Completa los campos obligatorios')
      return
    }

    setLoading(true)
    try {
      await onPublish({
        ...formData,
        price: parseFloat(formData.price),
        images,
        location,
      })

      setFormData({
        title: '',
        description: '',
        price: '',
        category: CATEGORIES[0],
      })
      setImages([])
      onClose()
    } catch (error) {
      alert('Error al publicar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-end">
      <div className="w-full bg-ts-card rounded-t-3xl max-h-96 overflow-y-auto p-6 animate-in slide-in-from-bottom">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-ts-primary italic">
            NUEVA PUBLICACIÓN
          </h2>
          <button
            onClick={onClose}
            className="bg-ts-card border border-ts-border rounded-full p-2 hover:bg-ts-primary transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Alert */}
          {!location && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-xs font-bold mb-2">
                ⚠️ Ubicación requerida
              </p>
              <button
                type="button"
                onClick={handleGetLocation}
                className="w-full bg-ts-primary hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MapPin size={14} /> Detectar mi ubicación
              </button>
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            placeholder="¿Qué vendes?"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full bg-dark-900 text-white px-4 py-3 rounded-xl border border-ts-border focus:border-ts-secondary outline-none text-sm"
          />

          {/* Price */}
          <input
            type="number"
            placeholder="Precio ($)"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full bg-dark-900 text-white px-4 py-3 rounded-xl border border-ts-border focus:border-ts-secondary outline-none text-sm"
          />

          {/* Category */}
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full bg-dark-900 text-white px-4 py-3 rounded-xl border border-ts-border focus:border-ts-secondary outline-none text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Description */}
          <textarea
            placeholder="Describe tu producto..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full bg-dark-900 text-white px-4 py-3 rounded-xl border border-ts-border focus:border-ts-secondary outline-none text-sm resize-none h-20"
          />

          {/* Image Upload */}
          <div>
            <label className="text-xs text-gray-400 font-bold mb-2 block">
              Imágenes ({images.length}/5)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${idx}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
                  >
                    <Trash2 size={12} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="border-2 border-dashed border-ts-border rounded-lg h-20 flex items-center justify-center cursor-pointer hover:bg-ts-card transition-colors">
                  <Plus size={20} className="text-gray-400" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !location}
            className="w-full bg-ts-primary hover:bg-orange-600 disabled:opacity-50 text-white font-black text-lg py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader size={18} className="animate-spin" />}
            {loading ? 'PUBLICANDO...' : 'PUBLICAR'}
          </button>
        </form>
      </div>
    </div>
  )
}
