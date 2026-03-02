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
  Download,
  Loader2,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function MillenniumPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const bank = {
    id: 'millenium',
    name: 'Millennium BCP',
    endpoint: '/converter/millenium/upload/',
    color: 'bg-emerald-600 hover:bg-emerald-700',
  };

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [conversions, setConversions] = useState({});

  // ─── Histórico ────────────────────────────────────────
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await http.get(bank.endpoint);
      setHistory(Array.isArray(data?.results) ? data.results : data || []);
    } catch (err) {
      console.error('Erro ao carregar histórico', err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ─── Upload ───────────────────────────────────────────
  const handleFileChange = (e) => setFile(e.target.files?.[0] ?? null);

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
          if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });

      if (data?.ok) {
        setUploadStatus('success');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchHistory();
        setTimeout(() => setUploadStatus(null), 3400);
      } else {
        throw new Error('Falha na resposta da API');
      }
    } catch (err) {
      console.error('Erro no upload', err);
      setUploadStatus('error');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  // ─── Delete ───────────────────────────────────────────
  const confirmDelete = async () => {
    if (!confirmDeleteItem) return;
    const item = confirmDeleteItem;
    setDeletingId(item.id);

    try {
      await http.delete(`${bank.endpoint}${item.id}/`);
      await fetchHistory();
    } catch (err) {
      console.error('Erro ao excluir', err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteItem(null);
    }
  };

  // ─── Convert ──────────────────────────────────────────
  const handleConvert = async (itemId) => {
    setConversions((prev) => ({ ...prev, [itemId]: { status: 'processing', uuid: null } }));

    try {
      const { data } = await http.post('/converter/millenium/extract/');
      if (data.ok && data.data?.uuid) {
        setConversions((prev) => ({
          ...prev,
          [itemId]: { status: 'success', uuid: data.data.uuid },
        }));
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (err) {
      console.error('Erro na conversão', err);
      setConversions((prev) => ({ ...prev, [itemId]: { status: 'error', uuid: null } }));
    }
  };

  // ─── Download Excel ───────────────────────────────────
const handleDownloadExcel = async (uuid) => {
  try {
    const url = `/converter/millenium/extract/${uuid}/download/`;

    const response = await http.get(url, {
      responseType: 'blob',
      // Se o seu http já injeta Authorization no interceptor, ok.
      // Se NÃO injeta, descomente e ajuste a linha abaixo:
      // headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    });

    // Tenta pegar o filename do header Content-Disposition
    const cd = response.headers?.['content-disposition'] || '';
    const match = cd.match(/filename\*?=(?:UTF-8''|")?([^;"\n]+)"?/i);
    const filename = match ? decodeURIComponent(match[1]) : `millenium.${uuid}.xlsx`;

    const blob = new Blob([response.data], {
      type: response.headers?.['content-type'] ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Erro ao baixar', err);
  }
};

  const openPdf = (item) => {
    if (item?.file_url) window.open(item.file_url, '_blank', 'noopener,noreferrer');
  };

  const formatSize = (bytes) => (bytes ? `${Math.round(bytes / 1024)} KB` : '—');

  const getStatusBadge = (status) => {
    const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full';
    switch (status) {
      case 'uploaded':
        return <span className={`${base} bg-slate-100 text-slate-700`}>Pendente</span>;
      case 'processing':
        return <span className={`${base} bg-blue-100 text-blue-700`}>Processando</span>;
      case 'processed':
        return (
          <span className={`${base} bg-emerald-100 text-emerald-700`}>
            <CheckCircle size={13} /> Concluído
          </span>
        );
      case 'error':
        return (
          <span className={`${base} bg-red-100 text-red-700`}>
            <AlertCircle size={13} /> Erro
          </span>
        );
      default:
        return <span className={`${base} bg-slate-100 text-slate-500`}>{status || '—'}</span>;
    }
  };

  const renderActionCell = (item) => {
    const conv = conversions[item.id] || {};
    const isProcessing = conv.status === 'processing';

    return (
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
        {conv.status === 'processing' ? (
          <button
            disabled
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md cursor-not-allowed"
          >
            <Loader2 size={14} className="animate-spin" /> Convertendo…
          </button>
        ) : conv.status === 'success' && conv.uuid ? (
          <button
            onClick={() => handleDownloadExcel(conv.uuid)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition"
          >
            <Download size={14} /> Excel
          </button>
        ) : (
          <button
            onClick={() => handleConvert(item.id)}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition disabled:opacity-50"
          >
            <RefreshCw size={14} /> Converter
          </button>
        )}

        <button
          onClick={() => openPdf(item)}
          disabled={!item.file_url}
          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition disabled:opacity-40"
          title="Ver PDF"
        >
          <Play size={16} />
        </button>

        <button
          onClick={() => setConfirmDeleteItem(item)}
          disabled={deletingId === item.id}
          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition disabled:opacity-40"
          title="Excluir"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        {/* Cabeçalho */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate('/dashboard/converter-extrato')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="text-sm text-slate-600">
            Banco: <span className="font-semibold text-slate-900">{bank.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6">
          {/* Área de upload */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className={`${bank.color} px-5 py-4 text-white`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Enviar novo extrato</h2>
                  <UploadCloud size={20} className="opacity-90" />
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {uploadStatus === 'success' && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle size={16} /> Enviado com sucesso!
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center gap-2">
                    <XCircle size={16} /> Erro ao enviar arquivo.
                  </div>
                )}

                <form onSubmit={handleUpload}>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />

                  <div
                    onClick={() => !file && fileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-xl p-8 sm:p-9 lg:p-10 text-center cursor-pointer transition-all
                      ${file
                        ? 'border-emerald-400 bg-emerald-50/40'
                        : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/30'
                      }
                    `}
                  >
                    {!file ? (
                      <div className="space-y-4">
                        <div className="mx-auto w-14 h-14 rounded-full bg-white shadow-sm border flex items-center justify-center">
                          <FileText className="text-emerald-600" size={28} />
                        </div>
                        <div>
                          <p className="text-slate-700 font-medium">Arraste ou clique aqui</p>
                          <p className="text-xs text-slate-500 mt-1.5">Apenas arquivos PDF</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="mt-2 px-5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                        >
                          Selecionar arquivo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                          <FileText className="text-emerald-700" size={24} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 truncate max-w-[260px] mx-auto">{file.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{formatSize(file.size)}</p>
                        </div>
                        <div className="flex justify-center gap-5 text-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="text-emerald-700 hover:underline"
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
                            className="text-slate-600 hover:underline"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploading && (
                    <div className="mt-5">
                      <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                        <span>Enviando...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!file || uploading}
                    className={`
                      mt-6 w-full py-3 px-6 rounded-xl font-medium text-white transition text-base
                      ${uploading
                        ? 'bg-emerald-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300/50'
                      }
                    `}
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" /> Enviando...
                      </span>
                    ) : (
                      'Enviar Extrato'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
              <div className="px-5 py-4 border-b bg-slate-50/70 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Histórico de envios</h2>
                <button
                  onClick={fetchHistory}
                  disabled={loadingHistory}
                  className="p-2 rounded-lg hover:bg-slate-200 transition"
                >
                  <RefreshCw size={18} className={loadingHistory ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-medium tracking-wide">
                      <th className="px-4 py-3.5 text-left whitespace-nowrap">Arquivo</th>
                      <th className="px-4 py-3.5 text-left whitespace-nowrap hidden sm:table-cell">Usuário</th>
                      <th className="px-4 py-3.5 text-left whitespace-nowrap">Status</th>
                      <th className="px-5 py-3.5 text-right whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingHistory ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center">
                          <Spinner size="lg" />
                        </td>
                      </tr>
                    ) : history.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-slate-500">
                          Nenhum extrato encontrado
                        </td>
                      </tr>
                    ) : (
                      history.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-medium text-slate-900 truncate max-w-[220px] sm:max-w-[300px] md:max-w-[380px] lg:max-w-[420px]">
                              {item.filename}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString('pt-PT', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                  })
                                : '—'}{' '}
                              • {formatSize(item.filesize)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-700 hidden sm:table-cell">
                            {item.owner_name || '—'}
                          </td>
                          <td className="px-4 py-4">{getStatusBadge(item.status)}</td>
                          <td className="px-5 py-4 text-right">{renderActionCell(item)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmDeleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle size={28} className="text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Excluir arquivo?</h3>
                  <p className="text-slate-600 mb-6 text-sm">
                    Esta ação não pode ser desfeita.
                    <br />
                    <span className="font-medium text-slate-900 break-all">
                      {confirmDeleteItem.filename}
                    </span>
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setConfirmDeleteItem(null)}
                      className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={deletingId === confirmDeleteItem.id}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition"
                    >
                      {deletingId === confirmDeleteItem.id && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}