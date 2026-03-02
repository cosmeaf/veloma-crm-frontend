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

export default function BradescoPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const bank = {
    id: 'bradesco',
    name: 'Bradesco',
    endpoint: '/converter/bradesco/upload/',
    extractEndpoint: '/converter/bradesco/extract/',
    color: 'bg-red-600 hover:bg-red-700',
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

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await http.get(bank.endpoint);
      setHistory(Array.isArray(data?.results) ? data.results : data || []);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
        setTimeout(() => setUploadStatus(null), 3000);
      } else {
        throw new Error();
      }
    } catch {
      setUploadStatus('error');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteItem) return;
    const item = confirmDeleteItem;
    setDeletingId(item.id);

    try {
      await http.delete(`${bank.endpoint}${item.id}/`);
      await fetchHistory();
    } finally {
      setDeletingId(null);
      setConfirmDeleteItem(null);
    }
  };

  const handleConvert = async (itemId) => {
    setConversions((prev) => ({
      ...prev,
      [itemId]: { status: 'processing', uuid: null },
    }));

    try {
      const { data } = await http.post(bank.extractEndpoint);
      if (data.ok && data.data?.uuid) {
        setConversions((prev) => ({
          ...prev,
          [itemId]: { status: 'success', uuid: data.data.uuid },
        }));
      } else {
        throw new Error();
      }
    } catch {
      setConversions((prev) => ({
        ...prev,
        [itemId]: { status: 'error', uuid: null },
      }));
    }
  };

  const handleDownloadExcel = async (uuid) => {
    try {
      const url = `${bank.extractEndpoint}${uuid}/download/`;

      const response = await http.get(url, {
        responseType: 'blob',
      });

      const cd = response.headers?.['content-disposition'] || '';
      const match = cd.match(/filename\*?=(?:UTF-8''|")?([^;"\n]+)"?/i);
      const filename = match ? decodeURIComponent(match[1]) : `bradesco.${uuid}.xlsx`;

      const blob = new Blob([response.data], {
        type:
          response.headers?.['content-type'] ||
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
      console.error(err);
    }
  };

  const openPdf = (item) => {
    if (item?.file_url) window.open(item.file_url, '_blank');
  };

  const formatSize = (bytes) => (bytes ? `${Math.round(bytes / 1024)} KB` : '—');

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto w-full max-w-[1920px] px-6 py-6">

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard/converter-extrato')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <div className="text-sm text-slate-600">
            Banco: <span className="font-semibold text-slate-900">{bank.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow border overflow-hidden">

              <div className={`${bank.color} px-5 py-4 text-white`}>
                <h2 className="text-base font-semibold">Enviar extrato</h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleUpload}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div
                    onClick={() => !file && fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
                  >
                    {!file ? (
                      <>
                        <FileText size={28} className="mx-auto mb-3 text-red-600" />
                        <p className="text-sm text-slate-600">Clique para selecionar PDF</p>
                      </>
                    ) : (
                      <p className="text-sm font-medium text-slate-800">{file.name}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!file || uploading}
                    className="mt-6 w-full py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {uploading ? 'Enviando...' : 'Enviar'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow border h-full flex flex-col">

              <div className="px-5 py-4 border-b flex justify-between items-center">
                <h2 className="text-base font-semibold">Histórico</h2>
                <button onClick={fetchHistory}>
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-slate-500">
                      <th className="px-4 py-3 text-left">Arquivo</th>
                      <th className="px-4 py-3 text-left">Usuário</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHistory ? (
                      <tr>
                        <td colSpan={3} className="py-10 text-center">
                          <Spinner />
                        </td>
                      </tr>
                    ) : history.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-10 text-center text-slate-500">
                          Nenhum extrato encontrado
                        </td>
                      </tr>
                    ) : (
                      history.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-3">{item.filename}</td>
                          <td className="px-4 py-3">{item.owner_name || '—'}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => handleConvert(item.id)}>
                              Converter
                            </button>
                            {conversions[item.id]?.uuid && (
                              <button
                                onClick={() =>
                                  handleDownloadExcel(conversions[item.id].uuid)
                                }
                              >
                                Download
                              </button>
                            )}
                            <button onClick={() => openPdf(item)}>
                              PDF
                            </button>
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
      </div>
    </div>
  );
}