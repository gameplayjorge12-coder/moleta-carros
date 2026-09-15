'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Loader2, X } from 'lucide-react';
import { VehicleSchema, type VehicleFormInput } from '@/lib/validation';
import imageCompression from 'browser-image-compression';
import { formatCurrency } from '@/lib/formatters';

interface AdminFormProps {
  onSuccess?: () => void;
}

/**
 * Formulário admin mobile-first para cadastro rápido
 * - Compressão de imagem no browser (10MB → 200KB)
 * - Upload para Supabase Storage
 * - Validação Zod
 */
export function AdminForm({ onSuccess }: AdminFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [compressionError, setCompressionError] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<VehicleFormInput>({
    resolver: zodResolver(VehicleSchema),
    defaultValues: {
      titulo: '',
      preco: 0,
      categoria: 'venda',
      descricao: '',
      fotos: [],
      status: 'disponivel',
    },
  });

  const precoValue = watch('preco');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    setCompressionError('');

    try {
      const newPhotos: string[] = [];

      for (const file of Array.from(files)) {
        // Compressão no browser (10MB -> ~200KB) antes de enviar
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        // Upload via rota server-side segura (chave secreta fica no servidor)
        const fd = new FormData();
        fd.append('file', compressedFile, file.name);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Falha no upload');

        newPhotos.push(json.url);
      }

      setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    } catch (err) {
      setCompressionError(
        err instanceof Error ? err.message : 'Erro ao enviar imagem'
      );
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: VehicleFormInput) => {
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, fotos: uploadedPhotos }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg =
          typeof json.error === 'string'
            ? json.error
            : 'Não foi possível cadastrar';
        throw new Error(msg);
      }

      alert('✅ Veículo cadastrado com sucesso!');
      reset();
      setUploadedPhotos([]);
      onSuccess?.();
    } catch (err) {
      alert(`❌ Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Título */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Título do Carro *
        </label>
        <input
          type="text"
          {...register('titulo')}
          placeholder="Ex: Hyundai Creta 2021"
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg input-focus"
          disabled={isSubmitting}
        />
        {errors.titulo && (
          <p className="text-danger text-sm mt-1">{errors.titulo.message}</p>
        )}
      </div>

      {/* Preço */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Preço (R$) *
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            {...register('preco', { valueAsNumber: true })}
            placeholder="45000"
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg input-focus"
            disabled={isSubmitting}
          />
          {precoValue > 0 && (
            <span className="text-primary font-bold text-lg">
              {formatCurrency(precoValue)}
            </span>
          )}
        </div>
        {errors.preco && (
          <p className="text-danger text-sm mt-1">{errors.preco.message}</p>
        )}
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Tipo *
        </label>
        <select
          {...register('categoria')}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg input-focus"
          disabled={isSubmitting}
        >
          <option value="venda">🚗 Venda</option>
          <option value="aluguel">🔑 Aluguel/Locadora</option>
        </select>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Descrição (Opcional)
        </label>
        <textarea
          {...register('descricao')}
          placeholder="Detalhes adicionais sobre o carro..."
          rows={3}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg input-focus resize-none"
          disabled={isSubmitting}
        />
        {errors.descricao && (
          <p className="text-danger text-sm mt-1">{errors.descricao.message}</p>
        )}
      </div>

      {/* Upload de Fotos */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Fotos ({uploadedPhotos.length}/10)
        </label>
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:bg-neutral-50">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="photo-upload"
            disabled={isSubmitting || uploadedPhotos.length >= 10}
          />
          <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              Clique para enviar ou arrastar fotos
            </span>
          </label>
        </div>

        {compressionError && (
          <p className="text-danger text-sm mt-2">{compressionError}</p>
        )}

        {/* Preview das fotos */}
        {uploadedPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {uploadedPhotos.map((photo, idx) => (
              <div
                key={idx}
                className="relative bg-neutral-100 rounded-lg overflow-hidden"
              >
                <img
                  src={photo}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-20 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 bg-danger text-white p-1 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão Submit */}
      <button
        type="submit"
        disabled={isSubmitting || uploadedPhotos.length === 0}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
        {isSubmitting ? 'Salvando...' : '➕ Cadastrar Veículo'}
      </button>
    </form>
  );
}
