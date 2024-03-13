"use strict";

let currentPage = 1;
let perPage = 5;
let selectedRoute;
let selectedGuide;
let searchedGuides;

const clearSelection = (name) => {
    let table = document.getElementById(name);
    for (let row of table.children) {
        row.classList.remove('table-secondary');
    }
};

const setLanguages = () => {
    let items = JSON.parse(sessionStorage.getItem('guides'));
    let select = document.getElementById('languages');
    select.innerHTML = '';

    let objs = ['Любой', ...items.map(item => item.language)];

    for (let obj of objs) {
        let option = new Option(obj, obj);
        select.appendChild(option);
    }
};

const displayOrder = () => {
    let orderBlock = document.getElementById('order');

    if (selectedRoute === undefined || selectedGuide === undefined) {
        orderBlock.classList.add('hide');
    } else {
        orderBlock.classList.remove('hide');
    }
};

const routeButtonHandler = async (item, tableRow) => {
    selectedRoute = item;
    clearSelection('routeTableBody');
    tableRow.classList.add('table-secondary');

    let guides = document.getElementById('guide');
    guides.classList.remove('hide');
    let header = document.querySelector('.guide-route');
    header.innerHTML = `Доступные гиды по маршруту ${item.name}`;
    await getGuides(item.id);
    searchedGuides = [];
    displayGuides();
    setLanguages();

    displayOrder();
};

const guideButtonHandler = (item, tableRow) => {
    selectedGuide = item;
    clearSelection('guideTable');
    tableRow.classList.add('table-secondary');

    displayOrder();
};

const getUrl = (path) => {
    let url = new URL(`https://edu.std-900.ist.mospolytech.ru/api/${path}`);
    url.searchParams.set("api_key", "86ee123c-0bda-4afa-8278-d341cdad90be");

    return url;
};

const getRoutes = async () => {
    let response = await fetch(getUrl('routes'));

    let routes = (await response.json()).map(item => {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            mainObject: item.mainObject
        };
    });

    sessionStorage.setItem('routes', JSON.stringify(routes));

    displayRoutes(1);
};

const getGuidesFromStorage = () => {
    let items = searchedGuides;
    if (!items || items.length === 0) {
        items = JSON.parse(sessionStorage.getItem('guides')) || [];
    }
    return items;
};

const displayGuides = () => {
    let table = document.getElementById('guideTable');
    let items = getGuidesFromStorage();
    table.innerHTML = '';

    for (let item of items) {
        let tr = document.createElement('tr');

        if (selectedGuide && item.id === selectedGuide.id) {
            tr.classList.add('table-secondary');
        }

        let img = document.createElement('th');
        let icon = document.createElement('i');
        icon.classList.add('bi', 'bi-person-circle');
        img.appendChild(icon);
        tr.appendChild(img);

        let name = document.createElement('th');
        name.innerHTML = item.name;
        tr.appendChild(name);

        let language = document.createElement('td');
        language.innerHTML = item.language;
        tr.appendChild(language);

        let workExperience = document.createElement('td');
        workExperience.innerHTML = item.workExperience;
        tr.appendChild(workExperience);

        let price = document.createElement('td');
        price.innerHTML = `${item.pricePerHour} руб/час`;
        tr.appendChild(price);

        let buttonTd = document.createElement('td');
        let button = document.createElement('button');
        button.innerHTML = 'Выбрать';
        button.classList.add('btn', 'btn-success', 'custom-button-style', 'primary', 'text-white');
        button.style.color = 'blue';
        button.onclick = () => {
            guideButtonHandler(item, tr);
        };
        buttonTd.appendChild(button);
        tr.appendChild(buttonTd);

        table.appendChild(tr);
    }
};

const getGuides = async (id) => {
    let response = await fetch(getUrl(`routes/${id}/guides`));
    let items = await response.json();
    sessionStorage.setItem('guides', JSON.stringify(items));
};

const createLi = (name, value, active) => {
    let li = document.createElement('li');
    li.classList.add('page-item');
    let link = document.createElement('a');
    link.innerHTML = name;
    link.classList.add('page-link', 'link');
    link.onclick = () => {
        displayRoutes(value);
    };
    li.appendChild(link);

    if (active) {
        link.classList.add('text-white', 'primary');
    }

    return li;
};

const displayPages = (page) => {
    let pages = document.querySelector('.pagination');
    pages.innerHTML = '';

    pages.appendChild(createLi('Первая страница', 1));

    let items = getRoutesFromStorage();
    let start = Math.max(page - 2, 1);
    let last = Math.ceil(items.length / perPage);
    let end = Math.min(page + 2, last);

    for (let i = start; i <= end; i++) {
        pages.appendChild(createLi(i, i, page === i));
    }

    pages.appendChild(createLi('Последняя страница', last));
};

const getRoutesFromStorage = () => {
    let items = JSON.parse(sessionStorage.getItem('searched-routes'));
    if (!items) {
        items = JSON.parse(sessionStorage.getItem('routes')) || [];
    }
    return items;
};

const displayRoutes = (page) => {
    let table = document.getElementById('routeTableBody');
    let items = getRoutesFromStorage();
    displayPages(page);
    table.innerHTML = '';

    clearSelection('routeTableBody');

    let end = Math.min(page * perPage, items.length);
    for (let i = (page - 1) * perPage; i < end; i++) {
        let tr = document.createElement('tr');

        if (selectedRoute && items[i].id === selectedRoute.id) {
            tr.classList.add('table-secondary');
        }

        let name = document.createElement('th');
        name.innerHTML = items[i].name;
        tr.appendChild(name);

        let descr = document.createElement('td');
        descr.innerHTML = items[i].description;
        tr.appendChild(descr);

        let obj = document.createElement('td');
        obj.innerHTML = items[i].mainObject;
        tr.appendChild(obj);

        let buttonTd = document.createElement('td');
        let button = document.createElement('button');
        button.innerHTML = 'Выбрать';
        button.classList.add('btn', 'btn-success', 'custom-button-style', 'primary', 'text-white');
        button.style.color = 'blue';
        button.onclick = () => {
            routeButtonHandler(items[i], tr);
        };
        buttonTd.appendChild(button);
        tr.appendChild(buttonTd);

        table.appendChild(tr);
    }
};

const setObjects = () => {
    let items = JSON.parse(sessionStorage.getItem('routes')) || [];
    let select = document.getElementById('objects');
    select.innerHTML = '';

    let objs = ['Любой', ...items.map(item => item.mainObject)];

    for (let obj of objs) {
        let option = new Option(obj, obj);
        select.appendChild(option);
    }
};

const searchRoute = (form) => {
    let items = JSON.parse(sessionStorage.getItem('routes')) || [];
    let search = form.elements['search'].value;
    let select = form.elements['objects'].value;

    let searched = [];

    if (search && search !== '') {
        for (let item of items) {
            if (item.name.includes(search)) {
                searched.push(item);
            }
        }
    }

    if (select !== 'Любой') {
        for (let i = searched.length - 1; i >= 0; i--) {
            if (!searched[i].mainObject.includes(select)) {
                searched.splice(i, 1);
            }
        }
    }

    sessionStorage.setItem('searched-routes', JSON.stringify(searched));
    displayRoutes(1);
};

const displayError = (block, message) => {
    let div = document.createElement('div');
    div.classList.add('alert', 'alert-danger');
    div.innerHTML = message;
    block.appendChild(div);
    setTimeout(() => div.remove(), 5000);
};

const searchGuide = (form) => {
    let items = JSON.parse(sessionStorage.getItem('guides')) || [];
    let languages = form.elements['languages'].value;
    let from = +form.elements['xpFrom'].value;
    let to = +form.elements['xpTo'].value;

    let searched = [];

    if (languages !== 'Любой') {
        searched = items.filter(item => item.language.includes(languages));
    } else {
        searched = [...items];
    }

    if (from < to) {
        searched = searched.filter(item => item.workExperience >= from && item.workExperience <= to);
    } else {
        displayError(document.querySelector('.guide-error-block'), 'Значение ОТ должно быть меньше ДО');
    }

    searchedGuides = searched;
    if (searched.length === 0) {
        displayError(document.querySelector('.guide-error-block'), 'Подходящие гиды не найдены, выведены доступные гиды');
    }
    displayGuides();
};

const getDatePrice = (date) => {
    let isWeekend = (date >= '2024-01-01' && date < '2024-01-09') ||
        new Date(date).getDay() === 6 && !['2024-04-27', '2024-11-02', '2024-12-28'].includes(date) ||
        new Date(date).getDay() === 7 ||
        ['2024-02-23', '2024-03-08', '2024-04-29', '2024-04-30', '2024-05-01', '2024-05-09',
            '2024-05-10', '2024-06-12', '2024-11-04', '2024-12-30', '2024-12-31'].includes(date);
    return isWeekend ? 1.5 : 1;
};

const updateForm = (modal) => {
    let duration = modal.target.querySelector('#duration').value;
    let count = modal.target.querySelector('#count').value;
    let time = modal.target.querySelector('#time').value;
    let date = modal.target.querySelector('#date').value;
    let option1 = modal.target.querySelector('#option1').checked;
    let option2 = modal.target.querySelector('#option2').checked;
    let btn = modal.target.querySelector('#modal-submit');

    let hour = +time.split(':')[0];
    let minutes = +time.split(':')[1];
    if (!(hour >= 9 && hour <= 23 && (minutes === 0 || minutes === 30))) {
        displayError(modal.target.querySelector('#modal-errors'), 'Доступно только время с 9 до 23 часов, каждые 30 минут!');
        btn.classList.add('disabled');
        return;
    }

    if (date === '' || time === '') {
        displayError(modal.target.querySelector('#modal-errors'), 'Необходимо указать время и дату!');
        btn.classList.add('disabled');
        return;
    }

    let isWeekend = getDatePrice(date);
    let morningPrice = (hour >= 9 && hour < 12) ? 400 : 0;
    let eveningPrice = (hour >= 20 && hour < 23) ? 1000 : 0;
    let visitorsPrice = (count < 5) ? 0 : (count < 10) ? 1000 : 1500;
    let option1Price = option1 ? (isWeekend ? 0.3 : 0.25) : 0;
    let option2Price = option2 ? selectedGuide.pricePerHour * 0.5 : 0;

    btn.classList.remove('disabled');
    let price = selectedGuide.pricePerHour * duration * (1 + option1Price) + morningPrice + eveningPrice + visitorsPrice + option2Price;
    price = Math.round(price);

    modal.target.querySelector('#price').innerHTML = price;

    btn.onclick = async () => {
        let form = new FormData();
        form.append('guide_id', selectedGuide.id);
        form.append('route_id', selectedRoute.id);
        form.append('date', date);
        form.append('time', time);
        form.append('duration', duration);
        form.append('persons', count);
        form.append('price', price);
        form.append('optionFirst', +option1);
        form.append('optionSecond', +option2);

        try {
            let response = await fetch(getUrl('orders'), {
                method: 'POST',
                body: form
            });

            if (!response.ok) {
                throw new Error('Ошибка сервера');
            }

            document.querySelector('#modal-close').click();
            btn.classList.remove('disabled');

            // Получаем заказы заново после отправки нового заказа
            await getOrders();

            // Обновляем отображение заказов
            displayOrder(currentPage);

            // Переключаемся на вкладку "Личный кабинет" (если есть такая вкладка)
            let personalTab = document.querySelector('#personal-tab');
            if (personalTab) {
                personalTab.click();
            } else {
                // Если вкладка "Личный кабинет" отсутствует, можно добавить логику перехода на нужную страницу
                window.location.href = 'personal.html';
            }
        } catch (error) {
            displayError(modal.target.querySelector('#modal-errors'), 'Ошибка при отправке заказа: ' + error.message);
        }
    };
};

window.onload = async () => {
    await getRoutes();
    setObjects();

    let routesForm = document.getElementById('routes-form');
    routesForm.onsubmit = (event) => {
        event.preventDefault();
        searchRoute(routesForm);
    };

    let select = document.getElementById('objects');
    select.onchange = () => {
        searchRoute(routesForm);
    };

    let guideForm = document.getElementById('guide-form');
    guideForm.onsubmit = (event) => {
        event.preventDefault();
        searchGuide(guideForm);
    };

    document.getElementById('orderModal').addEventListener('show.bs.modal', function (event) {
        event.target.querySelector('#fullname').innerHTML = selectedGuide.name;
        event.target.querySelector('#route-name').innerHTML = selectedRoute.name;
        event.target.querySelector('#time').value = '9:00';
        event.target.querySelector('#date').value = Date.now();

        event.target.querySelector('#duration').onchange = () => updateForm(event);
        event.target.querySelector('#count').oninput = () => updateForm(event);
        event.target.querySelector('#time').onchange = () => updateForm(event);
        event.target.querySelector('#date').onchange = () => updateForm(event);
        event.target.querySelector('#option1').onchange = () => updateForm(event);
        event.target.querySelector('#option2').onchange = () => updateForm(event);
    });
};
