document.getElementById('downloadBtn').addEventListener('click', async () => {
  const url = document.getElementById('url').value;
  const folder = document.getElementById('folder').value || '.';

  const response = await fetch('http://localhost:5001/download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url, output_path: folder }),
  });

  const result = await response.json();
  document.getElementById('status').innerText = result.message;
});