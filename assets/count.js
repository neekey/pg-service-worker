(function() {
    var countBtn = document.getElementById('countBtn');
    var countResultEl = document.getElementById('countResult');
    var count = 0;
    if (countBtn && countResultEl) {
        function updateCountResult() {
            countResultEl.innerHTML = 'count: ' + count;
        }
        updateCountResult();
        countBtn.addEventListener('click', function() {
            count++;
            updateCountResult();
        });
    }
})();