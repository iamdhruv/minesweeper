var GameController = (function() {
    var levels;
    var data;
    var elapsedTimeHandler;
    levels = {
        "1": {fieldSize: 10, noOfBombs: 5},
        "2": {fieldSize: 10, noOfBombs: 10},
        "3": {fieldSize: 15, noOfBombs: 20},
        "4": {fieldSize: 15, noOfBombs: 30},
        "5": {fieldSize: 20, noOfBombs: 30},
        "6": {fieldSize: 20, noOfBombs: 40}
    };
    data = {
        levelSelected: 0,
        bombsIndices: [],
        totalBlocks: 0,
        noOfBombs: 0,
        fieldSize: 0,
        sec: 0,
        min: 0,
        gameCompleted: 0
    };
    var compareNumbersForSort = function(n1, n2) {
        return (n1 - n2);
        };
    
    var getLevelMasterData = function(level) {
        return levels[level];
    };
    var setLevelSelected = function(level) {
        data.levelSelected = level;
    };
    var setRandomBlockIndices = function(totalBlocks, noOfIndices) {
        var indices = [];
        var randomNo;
        var i;
        for(i=0; i<noOfIndices; i=i+1) {
            randomNo = Math.floor(Math.random() * (totalBlocks - 1));
            if(indices.indexOf(randomNo) === -1) {
                indices.push(randomNo);
            } else {
                i = i-1;
            }
        }
        return indices.sort(compareNumbersForSort);
    };
    var getRandomBlocksHavingBombs = function() {
        var levelMasterData;
        levelMasterData = getLevelMasterData(data.levelSelected);
        data.totalBlocks = levelMasterData.fieldSize * levelMasterData.fieldSize;
        data.noOfBombs = levelMasterData.noOfBombs;
        data.fieldSize = levelMasterData.fieldSize;
        data.bombsIndices = setRandomBlockIndices(data.totalBlocks, data.noOfBombs);
        return data.bombsIndices;
    };
    var getData = function() {
        return data;
    };
    var getBlocksToCheck = function(currentBlockId) {
        var i,j, blocksNeeded, blocksToCheck;
        blocksNeeded = [];
        i = Math.floor(currentBlockId / data.fieldSize);
        j = (currentBlockId % data.fieldSize);
        blocksToCheck = [
            {row: (i-1), col: (j-1)},
            {row: (i-1), col: (j)},
            {row: (i-1), col: (j+1)},
            {row: (i), col: (j-1)},
            {row: (i), col: (j+1)},
            {row: (i+1), col: (j-1)},
            {row: (i+1), col: (j)},
            {row: (i+1), col: (j+1)}
        ];
        blocksToCheck.forEach(function(item, index) {
            if(item.row > -1 && item.col > -1 && item.row < (data.fieldSize) && item.col < (data.fieldSize)) {
                blocksNeeded.push((data.fieldSize * item.row) + item.col);
            }
        });
        return blocksNeeded;
    };

    var clickedBlockOperation = function(block) {
        if(block.classList.contains('flagged') || block.classList.contains('questioned') || data.gameCompleted==1) {
            return;
        }
        var response = adjacentBlocksOperations(block);
        if(response) {
            if(response.isBomb) {
                document.getElementById("smiley").src = 'img/unhappy.svg';
                document.getElementById('smiley-message').innerText = 'You Lost!!';
                document.getElementById('bombs-left').innerText = 0;
                block.style.backgroundColor = "red";
                openAllBlocks();
                clearInterval(elapsedTimeHandler);
                document.querySelector('.time-elapsed').classList.add('danger-color');
                document.getElementById('smiley-message').classList.add('danger-color');
            }
        }
        if(isGameCompleted()) {
            var allBombBlocks = document.querySelectorAll('.bomb');
            data.gameCompleted = 1;
            for(var i = 0; i< allBombBlocks.length; i++) {
                allBombBlocks[i].classList.add('flagged');
            }
            document.getElementById("smiley").src = 'img/happy.svg';
            document.getElementById('smiley-message').innerText = 'You Won!!';
            document.getElementById('smiley-message').classList.add('success-color');
            document.getElementById('bombs-left').innerText = 0;
            clearInterval(elapsedTimeHandler);
            document.querySelector('.time-elapsed').classList.add('success-color');
        }
    };

    var isGameCompleted = function() {
        var openedBlocks = document.querySelectorAll('.opened').length;
        if(data.totalBlocks === openedBlocks + data.noOfBombs) {
            return true;
        } else {
            return false;
        }
    }

    var adjacentBlocksOperations = function(block) {
        var currentBlockId, isBomb, isZero, isGreaterThanZero, blocksTocheck,res, isOpened,blocksNeeded, itemBlock;
        blocksNeeded = [];
        isOpened = block.classList.contains('opened');
        if(isOpened) {
            return;
        }
        currentBlockId = block.id;
        isBomb = block.classList.contains('bomb');
        adjacentBombs = block.getAttribute('data-no_of_adjacent_bombs');
        isZero = adjacentBombs == 0 ? true : false;
        isGreaterThanZero = adjacentBombs > 0 ? true : false;
        if(isBomb) {
            block.classList.add('opened');
            return {
                "isBomb": true
            };
        } else if(isZero) {
            block.classList.add('opened');
            blockId = currentBlockId.split('-')[1];
            blocksTocheck = getBlocksToCheck(blockId);
            blocksTocheck.forEach(function(item) {
                if(item >= 0   && item < (data.fieldSize * data.fieldSize)) {
                    res = adjacentBlocksOperations(document.getElementById('block-' + item));
                }
            });
        } else if(isGreaterThanZero) {
            block.classList.add('opened');
            block.innerHTML = block.getAttribute('data-no_of_adjacent_bombs');
        }
    };

    var openAllBlocks = function() {
        var isBomb, isZero, img;
        img = document.createElement('img');
        img.src = "img/bomb.svg";
        var table = document.querySelector('.minesweeper-table').classList.add("opened");
        var blocks = document.querySelectorAll('.single-block');
        for(var i=0; i<blocks.length; i++) {
            blocks[i].classList.add("opened");
            isBomb = blocks[i].classList.contains('bomb');
            isNotZero = blocks[i].getAttribute('data-no_of_adjacent_bombs') > 0 ? true : false;
            if(isBomb) {
                img = document.createElement('img');
                img.src = "img/bomb.svg";
                blocks[i].appendChild(img);
            } else if(isNotZero) {
                blocks[i].innerHTML = blocks[i].getAttribute('data-no_of_adjacent_bombs');
            } 
        }
    };

    var addBlocks = function(fieldSize, blocksHavingBombs) {
        
        addBlankBlocks();

        function addBlankBlocks() {
            var htmlString,partialString;
            htmlString = '';
            for(var i=0; i<fieldSize; i++) {
                partialString = '<tr>';
                for(var j=0; j<fieldSize; j++) {
                    partialString += '<td class="single-block" id="block-' + ((i * fieldSize) + (j)) +'"></td>';
                }
                partialString += '</tr>';
                document.querySelector('.minesweeper-field').insertAdjacentHTML('beforeend', partialString);
            }
            addBombInBlocks();

            function addBombInBlocks() {
                blocksHavingBombs.forEach(function(element) {
                    document.getElementById('block-' + element).classList.add('bomb');
                });
                addNumberInBlocks();
                
                function addNumberInBlocks() {
                    var blocksToCheckForBombs = [];
                    var currentBlock = 0; 
                    var noOfBombs;
                    var hasBomb;
                    for(var i=0; i<fieldSize; i++) {
                        for(var j=0; j<fieldSize; j++) {
                            noOfBombs = 0;
                            currentBlock = (fieldSize * i) + j;
                            blocksToCheckForBombs = getBlocksToCheck(currentBlock);
                            blocksToCheckForBombs.forEach(function(item) {
                                if(item >= 0 && item < (fieldSize * fieldSize)) {
                                    hasBomb = document.getElementById("block-" + item).classList.contains('bomb');
                                    noOfBombs = hasBomb === true ? (noOfBombs+1) : noOfBombs;
                                }
                            });
                            document.getElementById('block-' + currentBlock).setAttribute("data-no_of_adjacent_bombs", noOfBombs);
                        }
                    }
                }
            }
        }
    };

    var hideMineModal = function() {
        document.getElementById('select-level').style.display = "none";
    };

    var showControlsTable = function() {
        document.getElementById('controls-table').style.display = "table";
        document.getElementById('bombs-left').innerText = data.noOfBombs;
    };

    var rightClickedBlockOperation = function(block) {
        if(data.gameCompleted == 1) {
            return;
        }
        if(block.classList.contains('opened')) {
            return;
        } else if(block.classList.contains('flagged')) {
            block.classList.remove('flagged');
            block.classList.add('questioned');
            document.getElementById('bombs-left').innerText = parseInt(document.getElementById('bombs-left').innerText) + 1;
        } else if(block.classList.contains('questioned')) {
            block.classList.remove('questioned');
        } else {
            block.classList.add('flagged');
            document.getElementById('bombs-left').innerText = parseInt(document.getElementById('bombs-left').innerText) - 1;
        }
    }
    
    var setTimeElapsedInterval = function() {
        elapsedTimeHandler = setInterval(setTimeElapsed, 1000);
    }
    
    var setTimeElapsed = function() {
        data.sec = data.sec + 1;
        if(data.sec == 60) {
            data.sec = 0;
            data.min = data.min + 1;
            document.getElementById('time-elapsed-min').innerText = padNumberWithZero(data.min);
        }
        document.getElementById('time-elapsed-sec').innerText = padNumberWithZero(data.sec);
    }

    var padNumberWithZero = function(num) {
        return num.toString().length == 1 ? "0" + num : num;
    }

    return {
        setLevelSelected: setLevelSelected,
        getRandomBlocksHavingBombs: getRandomBlocksHavingBombs,
        getData: getData,
        clickedBlockOperation: clickedBlockOperation,
        addBlocks: addBlocks,
        hideMineModal: hideMineModal,
        rightClickedBlockOperation: rightClickedBlockOperation,
        showControlsTable: showControlsTable,
        setTimeElapsedInterval: setTimeElapsedInterval
    }
    
})();

var MainController = (function(GameCtrl) {
    var level, randomBlocksHavingBombs, setTimeElapsedInterval;
    
    function setSelectLevelBtnListener() {
        var allLevelButtons;
        allLevelButtons = document.querySelectorAll('.level-select-btn');
        for(var i=0; i<allLevelButtons.length; i++) {
            allLevelButtons[i].addEventListener('click', startGame);
        }
    }
    
    function startGame() {
        var buttonId, level;
        GameCtrl.setTimeElapsedInterval();
        GameCtrl.hideMineModal();
        buttonId = this.id;
        level = buttonId.split('-')[2];
        GameCtrl.setLevelSelected(level);
        randomBlocksHavingBombs = GameCtrl.getRandomBlocksHavingBombs(level);
        data = GameCtrl.getData();
        GameCtrl.addBlocks(data.fieldSize, randomBlocksHavingBombs);
        GameCtrl.showControlsTable();
    }

    function blockClickListener(event) {
        if(event.target && event.target.classList.contains('single-block')) {
            GameCtrl.clickedBlockOperation(event.target);
        }
    }

    function blockRightClickListener(event) {
        event.preventDefault();
        if(event.target && event.target.classList.contains('single-block')) {
            GameCtrl.rightClickedBlockOperation(event.target);
        }
    }

    function setUpEventListeners() {
        setSelectLevelBtnListener();
        document.querySelector('.minesweeper-table').addEventListener("click", blockClickListener);
        document.querySelector('.minesweeper-table').addEventListener("contextmenu", blockRightClickListener, false);
    }

    var init = function() {
        setUpEventListeners();
    };
    
    return {
        init: init
    }
}(GameController));

MainController.init();