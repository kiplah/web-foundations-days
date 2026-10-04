const loadBtn = document.getElementById('load-users');
const filterInput = document.getElementById('filter-input');
const statusMsg = document.getElementById('status');
const usersList = document.getElementById('users-list');

let usersData = [];

async function loadUsers() {
    loadBtn.disabled = true;
    statusMsg.textContent = 'Loading users...';
    usersList.textContent = '';
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        usersData = await response.json();
        statusMsg.textContent = 'Users loaded successfully!';
        renderUsers(usersData);
    } catch (error) {
        console.error("Fetch error: ", error);
        statusMsg.textContent = 'Failed to load users. Please try again later.';
        usersData = [];
    } finally {
        loadBtn.disabled = false;
    }
}

function renderUsers(list) {
    usersList.textContent = ''; // Clear list
    
    if (list.length === 0) {
        const li = document.createElement('li');
        li.textContent = "No users match your filter.";
        usersList.appendChild(li);
        return;
    }

    list.forEach(user => {
        const li = document.createElement('li');
        li.className = 'user-card';
        
        const nameEl = document.createElement('h3');
        nameEl.textContent = user.name;
        
        const emailEl = document.createElement('p');
        emailEl.textContent = `Email: ${user.email}`;
        
        const cityEl = document.createElement('p');
        cityEl.textContent = `City: ${user.address.city}`;
        
        const companyEl = document.createElement('p');
        companyEl.textContent = `Company: ${user.company.name}`;
        
        li.appendChild(nameEl);
        li.appendChild(emailEl);
        li.appendChild(cityEl);
        li.appendChild(companyEl);
        
        usersList.appendChild(li);
    });
}

loadBtn.addEventListener('click', loadUsers);

filterInput.addEventListener('input', (e) => {
    const filterText = e.target.value.toLowerCase();
    
    if (usersData.length === 0 && statusMsg.textContent !== 'Users loaded successfully!') {
        return; // Don't try filtering if users haven't successfully loaded yet
    }
    
    const filteredUsers = usersData.filter(user => 
        user.name.toLowerCase().includes(filterText)
    );
    
    renderUsers(filteredUsers);
});
