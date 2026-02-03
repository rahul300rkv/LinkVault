import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';


function UploadPage() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState(10);
  const [link, setLink] = useState('');

  const handleUpload = async () => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    else formData.append('text', text);
    formData.append('expiryMinutes', expiry);

    const res = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setLink(data.url);
  };

  return (
    <div className="p-10 max-w-xl mx-auto bg-white shadow-xl rounded-xl mt-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">LinkVault 🔒</h1>
      <textarea className="w-full p-3 border rounded-lg mb-4" placeholder="Paste text here..." onChange={e => setText(e.target.value)} />
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1">Or Upload File:</label>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
      </div>
      <input type="number" className="border p-2 w-full mb-4" placeholder="Expiry in minutes (default 10)" onChange={e => setExpiry(e.target.value)} />
      <button onClick={handleUpload} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Create Secure Link</button>
      {link && <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg break-all"><strong>Link:</strong> {link}</div>}
    </div>
  );
}


function ViewPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/content/${id}`)
      .then(res => res.ok ? res.json() : setError('Expired or Invalid Link'))
      .then(d => setData(d));
  }, [id]);

  if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;
  if (!data) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto bg-white shadow-xl rounded-xl mt-20">
      <h2 className="text-xl font-bold mb-4">Secure Content</h2>
      {data.type === 'text' ? (
        <div>
          <pre className="bg-gray-100 p-4 rounded-lg mb-4">{data.content}</pre>
          <button onClick={() => navigator.clipboard.writeText(data.content)} className="bg-gray-800 text-white px-4 py-2 rounded">Copy Text</button>
        </div>
      ) : (
        <a href={`http://localhost:5000/api/download/${id}`} className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-bold">Download File: {data.file_name}</a>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/v/:id" element={<ViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
