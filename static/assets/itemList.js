(function() {
    var prevPageBtn = document.getElementById('prevPage');
    var nextPageBtn = document.getElementById('nextPage');
    var currentPageEl = document.getElementById('currentPage');
    var itemListContainer = document.getElementById('itemList');
    var currentPage = 0;
    var itemList = [];
    function updateCurrentPage() {
        currentPageEl.innerHTML = currentPage;
    }

    function fetchItemForCurrentPage() {
        var url = '/api/data_list?page=' + currentPage;
        return fetch(url)
            .then(result => result.json());
    }

    function renderItemList() {
        itemListContainer.innerHTML = JSON.stringify(itemList);
    }

    function reloadItemList() {
        fetchItemForCurrentPage().then(data => {
            itemList = data;
            renderItemList();
        });
    }

    function onPrevPageClick() {
        if (currentPage > 0) {
            currentPage--;
            updateCurrentPage();
            reloadItemList();
        }

    }
    function onNextPageClick() {
        currentPage++; 
        updateCurrentPage(); 
        reloadItemList(); 
    }

    prevPageBtn.addEventListener('click', onPrevPageClick);
    nextPageBtn.addEventListener('click', onNextPageClick);
    updateCurrentPage();
})();