import { useEffect, useState } from 'react';
import http from '../../services/http';
import { Plus, Trash2, Edit, Save, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

export default function EntityView({ config }) {
  const { title, apiPath, listFields, formFields, icon: Icon } = config;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showPass, setShowPass] = useState(false);

  // ========================
  // Helpers
  // ========================
  const normalizePath = (path) =>
    path.endsWith('/') ? path : `${path}/`;

  const endpoint = normalizePath(apiPath);

  // ========================
  // Load data
  // ========================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoint);
      setData(res.data?.results || res.data || []);
    } catch (err) {
      console.error(`[EntityView] Erro ao carregar ${title}`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  // ========================
  // CRUD
  // ========================
  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar registo?')) return;

    try {
      await http.delete(`${endpoint}${id}/`);
      await fetchData();
    } catch (err) {
      console.error(`[EntityView] Erro ao eliminar`, err);
      alert('Erro ao eliminar registo.');
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item ? { ...item } : {});
    setShowPass(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({});
    setShowPass(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem?.id) {
        await http.patch(`${endpoint}${editingItem.id}/`, formData);
      } else {
        await http.post(endpoint, formData);
      }

      closeModal();
      await fetchData();
    } catch (err) {
      console.error(`[EntityView] Erro ao guardar`, err);
      alert('Erro ao guardar registo.');
    }
  };

  // ========================
  // Render
  // ========================
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Icon className="text-blue-600" />
          {title}
        </h2>
        <Button onClick={() => openModal()}>
          <Plus size={18} /> Novo Registo
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                {listFields.map((f) => (
                  <th
                    key={f}
                    className="p-4 text-xs uppercase text-gray-500"
                  >
                    {f}
                  </th>
                ))}
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {listFields.map((f) => (
                    <td key={f} className="p-4 text-sm">
                      {item[f] || '-'}
                    </td>
                  ))}
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(item)}
                      className="text-blue-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!data.length && (
                <tr>
                  <td
                    colSpan={listFields.length + 1}
                    className="p-6 text-center text-gray-400"
                  >
                    Nenhum registo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? 'Editar' : 'Adicionar'} {title}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                  </label>

                  <div className="relative">
                    <input
                      type={
                        field.type === 'password' && !showPass
                          ? 'password'
                          : field.type || 'text'
                      }
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData[field.key] || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                      required={field.required}
                    />

                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3 top-2.5 text-gray-400"
                      >
                        {showPass ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save size={18} /> Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
