const form = document.querySelector('#register-form form');

form.addEventListener('submit', (event) => {

  const password = document.getElementById('exampleInputPassword1').value;
  const passwordConfirm = document.getElementById('exampleInputPasswordCheck1').value;

  if (password !== passwordConfirm) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form
    window.alert('Passwords do not match');
  } 
  // else {
  //   console.log('Passwords match');
  //   window.location.href = 'register.php';
  // }

  // fetch('/register', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ username, password, email }),
  // })
  //   .then((response) => response.json())
  //   .then((data) => {
  //     if (data.error) {
  //       alert(data.error);
  //     } else {
  //       alert(data.message);
  //       window.location.href = '/login';
  //     }
  //   });
});