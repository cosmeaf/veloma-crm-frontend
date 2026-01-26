import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import http from '../services/http';
import { ArrowLeft, UploadCloud, FileText, CheckCircle, XCircle } from 'lucide-react';
import { BANKS } from '../config/banks';
import Spinner from '../components/ui/Spinner';

export default function BankUploadPage() {
  const { bankId } = useParams();
  const navigate = useNavigate();

  const [bank, setBank] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [progress, setProgress] = useState(0);

  // ========================
  // Resolve bank
  // ========================
  useEffect(() => {
    const foundBank = BANKS.find((b) => b.id === bankId);
    if (!foundBank) {
      navigate('/dashboard/converter-extrato', { replace: true });
      return;
    }
    setBank(foundBank);
  }, [bankId, navigate]);

  // ========================
  // Upload
  // ========================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !bank) return;

    setUploading(true);
    setStatus(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await http.post(bank.endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setProgress(percent);
        },
      });

      setProgress(100);
      setStatus('success');
      setFile(null);
    } catch (error) {
      console.error('[BankUpload] Upload error', error);
      setStatus('error');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  if (!bank) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="mr-2" size={20} />
        Voltar para a lista
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`${bank.color} p-8 text-white`}>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            {bank.name} - Conversor
          </h2>
          <p className="opacity-90 mt-2">
            Normalização de extratos bancários para Portugal.
          </p>
        </div>

        <div className="p-8">
          {/* Feedback */}
          {status === 'success' && (
            <div className="mb-6 flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-lg border border-green-200 animate-fade-in">
              <CheckCircle />
              Ficheiro processado com sucesso.
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200 animate-fade-in">
              <XCircle />
              Erro ao processar o ficheiro. Verifique se o formato é compatível
              com o {bank.name}.
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                }`}
            >
              <input
                type="file"
                id="fileInput"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                accept=".csv,.ofx,.xls,.xlsx,.txt,.pdf"
              />

              {!file ? (
                <>
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <FileText className="text-blue-500" size={40} />
                  </div>
                  <p className="text-gray-700 font-medium mb-2">
                    Arraste o extrato ou clique para selecionar
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    Suportado: OFX, CSV, Excel, PDF ({bank.name})
                  </p>
                  <label
                    htmlFor="fileInput"
                    className="bg-white border border-gray-300 px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-sm"
                  >
                    Selecionar Ficheiro
                  </label>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 p-4 rounded-full mb-4 text-blue-600">
                    <FileText size={32} />
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <label
                    htmlFor="fileInput"
                    className="text-blue-600 text-sm hover:underline cursor-pointer"
                  >
                    Trocar ficheiro
                  </label>
                </div>
              )}
            </div>

            {/* Progress */}
            {uploading && (
              <div className="w-full max-w-xs mx-auto mt-4">
                <div className="flex justify-between text-xs mb-1 text-gray-600">
                  <span>A processar...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${bank.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-4">
              <Link
                to="/dashboard/converter-extrato"
                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={!file || uploading}
                className="bg-blue-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
              >
                {uploading ? (
                  'A processar...'
                ) : (
                  <>
                    <UploadCloud size={18} /> Converter Extrato
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
