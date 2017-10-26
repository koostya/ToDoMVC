window.addEventListener('load', init);

var storage = {
    store: localStorage,
    add: function(ID, body) {
        this.store.setItem(ID, body);
    },
    delete: function(ID) {
        this.store.removeItem(ID);

    },
    update: function(ID, newText, completed) {
        for(item in this.store) {
            if(ID == item) {
                var body = {
                    id: ID,
                    text: newText,
                    checkboxID: parseInt(ID, 16),
                    completed: completed
                };
                this.store.setItem(item, JSON.stringify(body));
                break;
            }
        }
    }
}

function init() {
    var input = document.getElementById('main_input');

    getAllItems();
    checkIsHereItems();

    input.addEventListener('keypress', addNewItem());
}

function getAllItems() {
    for(var item in storage.store) {
        var id = JSON.parse(storage.store.getItem(item)).id,
            text = JSON.parse(storage.store.getItem(item)).text,
            checkboxID = JSON.parse(storage.store.getItem(item)).checkboxID,
            completed = JSON.parse(storage.store.getItem(item)).completed;

        createItem(text, id, checkboxID, completed);
    }
}

function checkIsHereItems() {
    var items = document.querySelectorAll('.item'),
        mvc = document.getElementById('mvc');

    if(items.length > 0) {
        addActiveClass(mvc);

        setHowManyItemsLeft();
        checkboxChange();
        initTabs();
        defineTypeOfTab();
        showChooseAllBut();
        showDeleteButtonForCompletedItems();
    }
}

function addNewItem() {
    return function(e) {
        if(e.keyCode == 13) {
            var mvc = document.getElementById('mvc'),
                input_wrapper = document.querySelector('.main_input_wrapper'),
                menu = document.querySelector('.menu'),
                itemID = createID(),
                newItem;

            newItem = createItem(this.value, itemID, parseInt(itemID, 16), false);

            var itemBody = {
                id: itemID,
                text: this.value,
                checkboxID: parseInt(itemID, 16),
                completed: false
            };

            storage.add(itemID, JSON.stringify(itemBody));

            addActiveClass(mvc);

            setHowManyItemsLeft();
            checkboxChange();
            initTabs();
            defineTypeOfTab();
            showChooseAllBut();
            showDeleteButtonForCompletedItems();

            this.value = '';
        }
    }
}

function updateItem(ID, text) {
    return function() {
        var items = document.querySelectorAll('.item'),
            updateInput = document.createElement('input');

        updateInput.classList.add('updateInput');
        updateInput.style.outline = '2px solid #000';
        updateInput.value = text;

        for(var i = 0; i < items.length; i++) {
            if(parseInt(items[i].getAttribute('id'), 10) == parseInt(ID, 10)) {
                items[i].appendChild(updateInput);
                updateInput.focus();
                updateInput.addEventListener('blur', finishUpdate(ID, i, items[i].classList.contains('completed')));
            }
        }
    }
}

function finishUpdate(ID, index, completed) {
    return function() {
        var textFields = document.querySelectorAll('.item > .text > span');

        this.parentNode.removeChild(this);
        textFields[index].innerHTML = this.value;
        storage.update(ID, this.value, completed);
    }
}

function createItem(txt, itemID, checkboxID, completed) {
    var item = document.createElement('div'),
        remove_but = document.createElement('div'),
        checkbox_wrap = document.createElement('div'),
        text = document.createElement('div'),
        checkbox = document.createElement('input'),
        menu = document.querySelector('.menu'),
        mvc = document.getElementById('mvc');

    item.classList.add('item');
    if(completed) {
        item.classList.add('completed');
    }
    item.setAttribute('id', itemID);
    item.addEventListener('dblclick', updateItem(itemID, txt));

    remove_but.setAttribute('class', 'remove');
    remove_but.addEventListener('click', removeItem(itemID), false);

    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('id', checkboxID);

    checkbox_wrap.setAttribute('class', 'checkbox');
    checkbox_wrap.appendChild(checkbox);
    checkbox_wrap.innerHTML += '<label for=' + '"' + checkboxID + '"' + '></label>';

    text.setAttribute('class', 'text');
    text.innerHTML = '<span>' + txt + '</span>';

    item.appendChild(checkbox_wrap);
    item.appendChild(text);
    item.appendChild(remove_but);

    mvc.insertBefore(item, menu);
}

function removeItem(ID) {
    return function() {
        var items = document.querySelectorAll('.item'),
            items_left = document.querySelector('.menu > .items_left > span'),
            mvc = document.getElementById('mvc');
        for(var i = 0; i < items.length; i++) {
            var itemID = items[i].getAttribute('id');
            if(parseInt(itemID, 10) == ID) {
                items[i].parentNode.removeChild(items[i]);
                storage.delete(parseInt(itemID, 10));
            }
        }
        setHowManyItemsLeft();
        checkboxChange();
        showChooseAllBut();
        showDeleteButtonForCompletedItems();
    }
}

function showDeleteButtonForCompletedItems() {
    var items = document.querySelectorAll('.item'),
        clear_but = document.getElementById('clear_completed'),
        choose_all_checkbox = document.getElementById('choose_all'),
        count = 0;

    for(var i = 0; i < items.length; i++) {
        if(items[i].classList.contains('completed')) {
            count++;
        }
    }

    if(count > 0 || choose_all_checkbox.checked) {
        addActiveClass(clear_but);
        clear_but.addEventListener('click', removeCompletedItems);
    } else if(count <= 0 || !choose_all_checkbox.checked) {
        removeActiveClass(clear_but);
    }
}

function showChooseAllBut() {
    var choose_all_checkbox = document.getElementById('choose_all'),
        choose_all_but = document.querySelector('.choose_all'),
        items = document.querySelectorAll('.item'),
        count =  0;

    for(var i = 0; i < items.length; i++) {
        if(items[i].classList.contains('completed')) {
            count++;
        }
    }

    if(items.length > 0) {

        addActiveClass(choose_all_but);
        choose_all_checkbox.checked = false;
        choose_all_checkbox.addEventListener('change', chooseAllItems());
    } else {
        removeActiveClass(choose_all_but);
    }
    if(count == items.length) {
        choose_all_checkbox.checked = true;
    }
}

function chooseAllItems() {
    return function() {
        var items = document.querySelectorAll('.item'),
            text = document.querySelectorAll('.item > .text > span'),
            checkboxes = document.querySelectorAll('.checkbox > input');

        for(var i = 0; i < items.length; i++) {
            if(this.checked) {
                addCompletedClass(items[i]);
                checkboxes[i].checked = true;
                showDeleteButtonForCompletedItems();
                storage.update(parseInt(items[i].getAttribute('id'), 10), text[i].innerHTML, true);
            } else {
                removeCompletedClass(items[i]);
                checkboxes[i].checked = false;
                showDeleteButtonForCompletedItems();
                storage.update(parseInt(items[i].getAttribute('id'), 10), text[i].innerHTML, false);
            }
        }
        setHowManyItemsLeft();
    }
}

function removeCompletedItems() {
    var items = document.querySelectorAll('.item');

    for(var i = 0; i < items.length; i++) {
        if(items[i].classList.contains('completed')) {
            items[i].parentNode.removeChild(items[i]);
            storage.delete(parseInt(items[i].getAttribute('id'), 10));
        }
    }

    setHowManyItemsLeft();
    checkboxChange();
    showChooseAllBut();
    showDeleteButtonForCompletedItems();
}

function checkboxChange() {
    var checkboxes = document.querySelectorAll('.checkbox > input'),
        items = document.querySelectorAll('.item'),
        text = document.querySelectorAll('.item > .text > span');

    for(var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].onchange = function(index) {
            return function() {
                if(checkboxes[index].checked) {
                    addCompletedClass(items[index]);
                    defineTypeOfTab();
                    showDeleteButtonForCompletedItems();
                    showChooseAllBut();
                    storage.update(parseInt(items[index].getAttribute('id'), 10), text[index].innerHTML, true);
                } else {
                    removeCompletedClass(items[index]);
                    defineTypeOfTab();
                    showDeleteButtonForCompletedItems();
                    showChooseAllBut();
                    storage.update(parseInt(items[index].getAttribute('id'), 10), text[index].innerHTML, false);
                }

                setHowManyItemsLeft();
            }
        }(i);
    }
}

function addActiveClass(item) {
    item.classList.add('active');
}

function removeActiveClass(item) {
    item.classList.remove('active');
}

function addCompletedClass(item) {
    item.classList.add('completed');
}

function removeCompletedClass(item) {
    item.classList.remove('completed');
}

function createID() {
    var id = new Date();
    return id.getTime();
}

function setHowManyItemsLeft() {
    var items = document.querySelectorAll('.item'),
        items_left = document.querySelector('.menu > .items_left > span'),
        mvc = document.getElementById('mvc'),
        count = 0;
    for(var i = 0; i < items.length; i++) {
        if(!items[i].classList.contains('completed')) {
            count++;
        }
    }
    if (items.length > 0) {
        items_left.innerHTML = count;
    } else {
        removeActiveClass(mvc);
    }
}

function initTabs() {
    var tabs = document.querySelectorAll('.tabs > .tab');
    for(var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', tabSelect(tabs, i));
    }
}

function tabSelect(tabs, index) {
    return function() {
        var items = document.querySelectorAll('.item');
        for(var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active');
        }
        tabs[index].classList.add('active');
        defineTypeOfTab();
    }
}

function defineTypeOfTab() {
    var tabs = document.querySelectorAll('.tab'),
        items = document.querySelectorAll('.item'),
        tabAttribute;
    for(var i = 0; i < tabs.length; i++) {
        if(tabs[i].classList.contains('active')) {
            tabAttribute = tabs[i].getAttribute('data');
        }
    }
    if(tabAttribute == 'all') {
        for(var i = 0; i < items.length; i++) {
            items[i].style.display = 'flex';
        }
    }
    if(tabAttribute == 'active') {
        for(var i = 0; i < items.length; i++) {
            if(items[i].classList.contains('completed')) {
                items[i].style.display = 'none';
            } else {
                items[i].style.display = 'flex';
            }
        }
    }
    if(tabAttribute == 'completed') {
        for(var i = 0; i < items.length; i++) {
            if(!items[i].classList.contains('completed')) {
                items[i].style.display = 'none';
            } else {
                items[i].style.display = 'flex';
            }
        }
    }
}

