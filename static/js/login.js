document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const username = this.username.value;
  const password = this.password.value;

  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  })
  .then(res => {
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  })
  .then(data => {
    console.log('success:', data);
  })
  .catch(err => console.error(err));
});