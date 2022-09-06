// eslint-disable-next-line strict, lines-around-directive
'use strict';

console.log('add.js');
const baseUrl = 'http://localhost:3000/api';

const formEl = document.forms[0];
const feedbackEl = document.getElementById('feedback');

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFeedback();

  // surinkti formos inputus
  const newCar = {
    title: formEl.elements.title.value,
    image: formEl.elements.image.value,
    price: formEl.elements.price.value,
    numberPlates: formEl.elements.numberPlates.value,
  };
  console.log('newCar ===', newCar);
  // back end validation logic in fron end
  const { title, image, price, numberPlates } = newCar;
  if (
    [title.trim(), image.trim(), price.trim(), numberPlates.trim()].includes('')
  ) {
    // we have error
    showAlert('Visi laukai privalomi');
    return;
  }
  // siusti newCar i musu back end
  const resp = await fetch(`${baseUrl}/cars`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(newCar),
  });

  console.log('resp ===', resp);

  // o neigiama mes rodom klaidas

  if (resp.ok) {
    // redirect
    window.location.href = 'index.html';
  } else if (resp.status === 400) {
    const dataInJs = await resp.json();
    console.log('dataInJs ===', dataInJs);
    if (dataInJs.type === 'validation') {
      console.log('dataInJs.msg ===', dataInJs.msg);
      // handleErrors() - > atvaizduoja klaidas
      showAlert(dataInJs.msg);
    }
  }
});

function showAlert(msg) {
  const alertHtml = `
  <div class="alert alert-danger alert-dismissible fade show" role="alert">
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>  
  `;
  feedbackEl.innerHTML = alertHtml;
}

function clearFeedback() {
  feedbackEl.innerHTML = '';
}
