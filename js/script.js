var GameController = (function() {
    var levels, data;

    levels = {
        1: {fieldSize: 4, noOfBombs: 1},
        2: {fieldSize: 10, noOfBombs: 1},
        3: {fieldSize: 15, noOfBombs: 1},
        4: {fieldSize: 15, noOfBombs: 30},
        5: {fieldSize: 20, noOfBombs: 30},
        6: {fieldSize: 20, noOfBombs: 50},
    }

    data = {
        levelSelected: 0,
        bombsIndices: [],
        totalBlocks: 0,
        noOfBombs: 0,
        fieldSize: 0
    }
    
    var compareNumbersForSort = function(n1, n2) {
        return (n1 - n2); 
    }

    var getLevelMasterData = function(level) {
        return levels[level];
    }

    var setLevelSelected = function(level) {
        data.levelSelected = level;
    }

    var setRandomBlockIndices = function(totalBlocks, noOfIndices) {
        var indices, randomNo;
        indices = [];
        for(var i=0; i<noOfIndices; i = i+1) {
            randomNo = Math.floor(Math.random() * (totalBlocks - 1));
            if(indices.indexOf(randomNo) === -1) {
                indices.push(randomNo);
            } else {
                i = i-1;
            }
        }
        return indices.sort(compareNumbersForSort);
    }

    var getRandomBlocksHavingBombs = function() {
        var levelMasterData;
        levelMasterData = getLevelMasterData(data.levelSelected);
        data.totalBlocks = levelMasterData.fieldSize * levelMasterData.fieldSize;
        data.noOfBombs = levelMasterData.noOfBombs;
        data.fieldSize = levelMasterData.fieldSize;
        data.bombsIndices = setRandomBlockIndices(data.totalBlocks, data.noOfBombs);
        return data.bombsIndices;
    }

    var getData = function() {
        return data;
    }

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
    }
    var clickedBlockOperation = function(block) {
        var response = adjacentBlocksOperations(block);
        if(response) {
            if(response.isBomb) {
                block.style.backgroundColor = "red";
                openAllBlocks();
            }
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
            console.log(currentBlockId);
            console.log(blocksTocheck);
            // blocksTocheck.forEach(function(item) {
            //     if(item >= 1   && item <= (data.fieldSize * data.fieldSize)) {
            //         res = adjacentBlocksOperations(document.getElementById('block-' + item));
            //     }
            // });
        } else if(isGreaterThanZero) {
            block.classList.add('opened');
            block.innerHTML = block.getAttribute('data-no_of_adjacent_bombs');
        }
    }
    var openAllBlocks = function() {
        var isBomb, isZero, img;
        img = document.createElement('img');
        img.src = "img/bomb.svg";
        var table = document.querySelector('.minesweeper-table').classList.add("table-outset-removed");
        var blocks = document.querySelectorAll('.single-block');
        for(var i=0; i<blocks.length; i++) {
            blocks[i].classList.add("table-outset-removed");
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
    }

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
                            currentBlock = (fieldSize * i) + j + 1;
                            blocksToCheckForBombs = [
                                (fieldSize * (i-1)) + (j-1) + 1,
                                (fieldSize * (i-1)) + (j) + 1,
                                (fieldSize * (i-1)) + (j+1) + 1,
                                (fieldSize * (i)) + (j-1) + 1,
                                (fieldSize * (i)) + (j+1) + 1,
                                (fieldSize * (i+1)) + (j-1) + 1,
                                (fieldSize * (i+1)) + (j) + 1,
                                (fieldSize * (i+1)) + (j+1) + 1,
                            ];
                            
                            blocksToCheckForBombs.forEach(function(item) {
                                if(item >= 1 && item <= (fieldSize * fieldSize)) {
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
    }

    var hideMineModal = function() {
        document.getElementById('select-level').style.display = "none";
    }

    return {
        setLevelSelected: setLevelSelected,
        getRandomBlocksHavingBombs: getRandomBlocksHavingBombs,
        getData: getData,
        clickedBlockOperation: clickedBlockOperation,
        addBlocks: addBlocks,
        hideMineModal: hideMineModal
    }
    
})();

var MainController = (function(GameCtrl) {
    var level, randomBlocksHavingBombs;
    
    function setSelectLevelBtnListener() {
        var allLevelButtons;
        allLevelButtons = document.querySelectorAll('.level-select-btn');
        for(var i=0; i<allLevelButtons.length; i++) {
            allLevelButtons[i].addEventListener('click', startGame);
        }
    }
    
    function startGame() {
        var buttonId, level;
        GameCtrl.hideMineModal();
        buttonId = this.id;
        level = buttonId.split('-')[2];
        GameCtrl.setLevelSelected(level);
        randomBlocksHavingBombs = GameCtrl.getRandomBlocksHavingBombs(level);
        data = GameCtrl.getData();
        GameCtrl.addBlocks(data.fieldSize, randomBlocksHavingBombs);
    }

    function blockClickListener(event) {
        if(event.target && event.target.classList.contains('single-block')) {
            GameCtrl.clickedBlockOperation(event.target);
        }
    }
    function setUpEventListeners() {
        setSelectLevelBtnListener();
        document.querySelector('.minesweeper-table').addEventListener("click", blockClickListener);
    }

    var init = function() {
        setUpEventListeners();
    };
    
    return {
        init: init
    }
}(GameController));

MainController.init();