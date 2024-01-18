
const username = document.getElementById('username');

const perPageSelect = document.getElementById('perPage');
const searchInput = document.getElementById('search');
const repositoriesContainer = document.getElementById('repositories');
const paginationContainer = document.getElementById('pagination');

const profileImage = document.getElementsByClassName('profile-image');
const profileName = document.getElementsByClassName('profile-name');
const profileBio = document.getElementsByClassName('profile-bio');
const profileFollowers = document.getElementsByClassName('profile-followers');
const profileLocation = document.getElementsByClassName('profile-location');

let currentPage = 1;
let repositoriesPerPage = perPageSelect.value;
let totalCount = 0;
let reposDataArray = [];

let apiUrl = '';
let repoUrl = '';

async function fetchPersonalData(apiUrl) {
  const apiResponse = await fetch(apiUrl);
  const apiData = await apiResponse.json();
  console.log(apiData);
  profileImage[0].src = apiData.avatar_url;
  profileName[0].textContent = apiData.name;
  profileBio[0].textContent = apiData.bio;
  profileFollowers[0].textContent = apiData.followers;
  profileLocation[0].textContent = apiData.location;
}

async function fetchData() {
  apiUrl = `https://api.github.com/users/${username.value}`;
  repoUrl = `https://api.github.com/users/${username.value}/repos`;
  const fetchUrl = `${apiUrl}/repos?page=${currentPage}&per_page=${perPageSelect.value}`;
  console.log(fetchUrl);

  // Show loader
  repositoriesContainer.innerHTML = 'Loading...';

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const repoResponse = await fetch(repoUrl);
    const repoData = await repoResponse.json();
    reposDataArray = repoData;
    totalCount = repoData.length;
    const repositoriesData = await response.json();

    displayRepositories(repositoriesData, totalCount);

  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    repositoriesContainer.innerHTML = 'Error fetching repositories';
  }
}

function changePage(page) {
  currentPage = page;
  fetchData();
}


function displayRepositories(repositoriesData, totalCount) {
  // Hide loader
  repositoriesContainer.innerHTML = '';

  repositoriesData.forEach(repo => {
    const repoCard = document.createElement('div');
    repoCard.classList.add('card', 'mb-3');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const repoName = document.createElement('h5');
    repoName.classList.add('card-title');
    repoName.textContent = repo.name;

    const repoDescription = document.createElement('p');
    repoDescription.classList.add('card-text');
    repoDescription.textContent = repo.description || 'No description';

    const topicsList = document.createElement('div');
    topicsList.classList.add('topics-list');
    repo.topics.forEach(topic => {
      const topicItem = document.createElement('span');
      topicItem.classList.add('topic-item');
      topicItem.textContent = topic;
      topicsList.appendChild(topicItem);
    });

    cardBody.appendChild(repoName);
    cardBody.appendChild(repoDescription);
    cardBody.appendChild(topicsList);

    repoCard.appendChild(cardBody);
    repositoriesContainer.appendChild(repoCard);
  });


  // Pagination logic
  const totalPages = Math.ceil(totalCount / repositoriesPerPage);

  paginationContainer.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const paginationItem = document.createElement('li');
    paginationItem.classList.add('page-item');
    if (i === currentPage) {
      paginationItem.classList.add('active');
    }
    const paginationLink = document.createElement('a');
    paginationLink.classList.add('page-link');
    paginationLink.href = '#';
    paginationLink.textContent = i;
    paginationLink.onclick = () => changePage(i);
    paginationItem.appendChild(paginationLink);
    paginationContainer.appendChild(paginationItem);
  }
}

async function fetchSearchData() {
  const searchString = searchInput.value.toLowerCase();
  if (searchString === '') {
    fetchData();
    return;
  }

  // Check if reposDataArray is empty, fetch data if needed
  if (reposDataArray.length === 0) {
    await fetchData();
  }

  const filteredRepositories = reposDataArray.filter((repo) => {
    return (
      repo.name.toLowerCase().includes(searchString)
    );
  });
  displayRepositories(filteredRepositories, totalCount);
}

function fetchUser() {
  fetchData();
  fetchPersonalData(apiUrl);
}