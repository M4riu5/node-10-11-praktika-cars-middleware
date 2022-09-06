console.log('main.js');

// eslint-disable-next-line strict, linebreak-style

const baseUrl = 'http://localhost:3000/api';
const carListEl = document.getElementById('cars');
const modalDeleteEl = document.getElementById('modalDelete');
let currentDeleteCarId = null;

modalDeleteEl.addEventListener('click', () => {
  console.log('currentDeleteCarId ===', currentDeleteCarId);
  console.log('modal delete car');
  deleteCar(currentDeleteCarId);
});

function makeCarsListHtml(carsArr, dest) {
  dest.innerHTML = '';
  carsArr.forEach((cObj) => {
    const carDivEl = document.createElement('div');
    carDivEl.className = 'card';
    carDivEl.innerHTML = `
    <img src="images/${cObj.image}" class="card-img-top img-fluid" alt="..." />
    <div class="card-body">
      <h5 class="card-title">${cObj.title}</h5>
      <p class="card-text"
        >${cObj.numberPlates} - Price: $${cObj.price}</p
      >
    </div>
    `;
    const buttonEl = document.createElement('button');
    buttonEl.addEventListener('click', () => (currentDeleteCarId = cObj.id));
    buttonEl.textContent = 'delete';
    buttonEl.classList = 'btn btn-danger';
    // data-bs-toggle="modal" data-bs-target="#myModal"
    buttonEl.dataset.bsToggle = 'modal';
    buttonEl.dataset.bsTarget = '#deleteModal';
    carDivEl.querySelector('.card-body').append(buttonEl);
    dest.append(carDivEl);
  });
}

async function getCars(url, callBack) {
  const resp = await fetch(url);
  const dataInJs = await resp.json();
  console.log('dataInJs ===', dataInJs);
  callBack(dataInJs, carListEl);
}

getCars(`${baseUrl}/cars`, makeCarsListHtml);

async function deleteCar(idToDelete) {
  console.log('delete car', idToDelete);
  // siusti delete uzklausa i back end
  const resp = await fetch(`${baseUrl}/cars/${idToDelete}`, {
    method: 'DELETE',
  });
  // pasitikrinam ar resp.ok arba resp.status
  console.log('resp ===', resp);
  // jei ok tai atnaujinam sarasa
  if (resp.ok) {
    getCars(`${baseUrl}/cars`, makeCarsListHtml);
  }
  // jei ne pranesam apie klaida
}
