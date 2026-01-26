import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../services/http';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  CheckCircle,
  XCircle,
  Play,
  Trash2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function MillenniumPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const bank = {
    id: 'millenium',
    name: 'Millennium BCP',
    endpoint: '/converter/millenium/upload/',
    color: 'bg-green-600',
  };

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

  const openPicker = () => fileInputRef.current?.click();

  // =========================
  // HISTÓRICO
  // =========================
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await http.get(bank.endpoint);
      const items = data?.results || data || [];
      setHistory(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('[History Error]', error);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // =========================
  // UPLOAD
  // =========================
  const handleFileChange = (e) => {
    const f = e.target?.files?.[0] || null;
    setFile(f);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await http.post(bank.endpoint, formData, {
        onUploadProgress: (evt) => {
          if (evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setProgress(percent);
          }
        },
      });

      if (data?.ok) {
        setUploadStatus('success');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchHistory();
        setTimeout(() => setUploadStatus(null), 2500);
      } else {
        throw new Error('API returned ok=false');
      }
    } catch (error) {
      console.error('[Upload Error]', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  // =========================
  // DELETE
  // =========================
  const requestDelete = (item) => {
    setConfirmDeleteItem(item);
  };

  const confirmDelete = async () => {
    const item = confirmDeleteItem;
    if (!item) return;

    setDeletingId(item.id);
    try {
      await http.delete(`${bank.endpoint}${item.id}/`);
      await fetchHistory();
    } catch (error) {
      console.error('[Delete Error]', error);
    } finally {
      setDeletingId(null);
      setConfirmDeleteItem(null);
    }
  };

  const openPdf = (item) => {
    if (item?.file_url) {
      window.open(item.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatKb = (bytes) => {
    if (!bytes) return '-';
    return `${Math.round(bytes / 1024)}KB`;
  };

  const getStatusBadge = (status) => {
    const base =
      'px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1';

    switch (status) {
      case 'uploaded':
        return <span className={`${base} bg-gray-100 text-gray-600`}>Não iniciado</span>;
      case 'processing':
        return <span className={`${base} bg-blue-100 text-blue-700`}>Processando</span>;
      case 'processed':
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            <CheckCircle size={12} /> Processado
          </span>
        );
      case 'error':
        return (
          <span className={`${base} bg-red-100 text-red-700`}>
            <AlertCircle size={12} /> Erro
          </span>
        );
      default:
        return <span className={`${base} bg-gray-100 text-gray-500`}>{status || '-'}</span>;
    }
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 animate-fade-in pb-12">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/converter-extrato')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="mr-1" size={18} />
          Voltar
        </button>
        <div>
          <span className="text-sm text-gray-500 mr-2">Visualizando:</span>
          <span className="font-bold text-gray-800">{bank.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* UPLOAD */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`${bank.color} px-6 py-4 flex items-center justify-between`}>
              <h3 className="text-white font-semibold">Novo Upload</h3>
              <UploadCloud size={20} className="text-white opacity-80" />
            </div>

            <div className="p-6">
              {uploadStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                  <CheckCircle size={16} /> Sucesso!
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                  <XCircle size={16} /> Erro ao enviar.
                </div>
              )}

              <form onSubmit={handleUpload}>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="application/pdf,.pdf"
                />

                {/* Dropzone */}
                <div
                  onClick={!file ? openPicker : undefined}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${!file ? 'cursor-pointer' : ''
                    } ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}
                >
                  {!file ? (
                    <>
                      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                        <FileText className="text-green-600" size={28} />
                      </div>
                      <p className="text-gray-700 font-medium text-sm mb-1">
                        Clique para selecionar o PDF
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPicker();
                        }}
                        className="mt-4 px-4 py-2 text-sm rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                      >
                        Selecionar arquivo
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="bg-green-100 p-3 rounded-full mb-2 text-green-600">
                        <FileText size={24} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / 1024).toFixed(0)}KB
                      </p>

                      <div className="flex gap-4 mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPicker();
                          }}
                          className="text-green-700 text-xs hover:underline"
                        >
                          Trocar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-gray-600 text-xs hover:underline"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1 text-gray-500 font-medium">
                      <span>Enviando...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="w-full mt-6 bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  {uploading ? 'Enviando...' : 'Enviar Arquivo'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Histórico de Upload</h3>
              <button
                onClick={fetchHistory}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <RefreshCw size={16} className={loadingHistory ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <th className="px-6 py-3">Arquivo</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <Spinner size="md" />
                      </td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                        Nenhum arquivo.
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800 truncate">
                            {item.filename}
                          </div>
                          <div className="text-xs text-gray-400">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString('pt-PT')
                              : '-'}{' '}
                            • {formatKb(item.filesize)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {item.owner_name || '-'}
                        </td>

                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openPdf(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Abrir PDF"
                              disabled={!item.file_url}
                            >
                              <Play size={16} />
                            </button>

                            <button
                              onClick={() => requestDelete(item)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded"
                              title="Excluir"
                              disabled={deletingId === item.id}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DELETE */}
      {confirmDeleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Confirmar exclusão
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Deseja excluir o arquivo:
              <br />
              <strong>{confirmDeleteItem.filename}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteItem(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
