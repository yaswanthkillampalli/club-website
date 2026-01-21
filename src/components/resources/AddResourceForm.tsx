import { useState } from 'react';
import { addResource } from '@/lib/api/resources';

export default function AddResourceForm({ user, onSuccess, onCancel }: any) {
  const [form, setForm] = useState({ title: '', desc: '', url: '', category: 'dev', tags: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tagsArray = form.tags.split(',').map(t => t.trim());
      await addResource(form.title, form.desc, form.url, form.category, tagsArray, user.id);
      onSuccess();
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const inputStyle = "w-full bg-black border border-white/10 p-3 rounded text-white focus:border-yellow-500 outline-none mb-4";
  const labelStyle = "text-xs text-gray-500 uppercase font-bold mb-1 block";

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label className={labelStyle}>Title</label>
        <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputStyle} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Category</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputStyle}>
            <option value="academic">Academic Notes</option>
            <option value="dev">Development</option>
            <option value="design">Design</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelStyle}>Tags</label>
          <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="react, pdf" className={inputStyle} />
        </div>
      </div>

      <div>
        <label className={labelStyle}>URL</label>
        <input required type="url" value={form.url} onChange={e => setForm({...form, url: e.target.value})} className={inputStyle} />
      </div>

      <div>
        <label className={labelStyle}>Description</label>
        <textarea required rows={3} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className={inputStyle} />
      </div>

      <div className="flex gap-4 mt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-white/5 rounded font-bold hover:bg-white/10">CANCEL</button>
        <button disabled={loading} type="submit" className="flex-1 py-3 bg-yellow-600 text-black rounded font-bold hover:bg-yellow-500">
          {loading ? 'POSTING...' : 'POST RESOURCE'}
        </button>
      </div>
    </form>
  );
}