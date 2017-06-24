var GameController = (function() {
    var levels;

    var data = {
        levelSelected: 0,
        bombsIndices: [],
        totalBlocks: 0,
        noOfBombs: 0,
        fieldSize: 0
    }
    levels = {
        1: {fieldSize: 10, noOfBombs: 10},
        2: {fieldSize: 10, noOfBombs: 20},
        3: {fieldSize: 20, noOfBombs: 20},
        4: {fieldSize: 20, noOfBombs: 40},
        5: {fieldSize: 30, noOfBombs: 60},
        6: {fieldSize: 30, noOfBombs: 100},
    }

    var setLevelSelected = function(level) {
        data.levelSelected = level;
    }

    var compareNumbersForSort = function(n1, n2) {
        return (n1 - n2); 
    }

    var setRandomBlockIndices = function(totalBlocks, noOfIndices) {
        var indices, randomNo;
        indices = [];
        for(var i=0; i<noOfIndices; i = i+1) {
            randomNo = Math.floor(Math.random() * totalBlocks);
            if(indices.indexOf(randomNo) === -1 && randomNo !==0) {
                indices.push(randomNo);
            } else {
                i = i-1;
            }
        }
        return indices.sort(compareNumbersForSort);
    }

    var getRandomBlocksHavingBombs = function() {
        var levelMasterData;
        levelMasterData = levels[data.levelSelected];
        data.totalBlocks = levelMasterData.fieldSize * levelMasterData.fieldSize;
        data.noOfBombs = levelMasterData.noOfBombs;
        data.fieldSize = levelMasterData.fieldSize;
        data.bombsIndices = setRandomBlockIndices(data.totalBlocks, data.noOfBombs);
        return data.bombsIndices;
    }

    var getData = function() {
        return data;
    }
    return {
        setLevelSelected: setLevelSelected,
        getRandomBlocksHavingBombs: getRandomBlocksHavingBombs,
        getData: getData
    }
    
})();

var UIController = (function() {
   
    var addBlocks = function(fieldSize, blocksHavingBombs) {

        addBlankBlocks();

        function addBlankBlocks() {
            var htmlString,partialString;
            htmlString = '';
            for(var i=0; i<fieldSize; i++) {
                partialString = '<tr>';
                for(var j=0; j<fieldSize; j++) {
                    partialString += '<td class="single-block" id="block-' + ((i * fieldSize) + (j+1)) +'"></td>';
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

    return {
        addBlocks: addBlocks
    }

})();

var MainController = (function(GameCtrl, UICtrl) {
    var level, randomBlocksHavingBombs;
    
    var init = function() {
        level = prompt("Please enter level From 1 to 4", "");
        GameCtrl.setLevelSelected(level);
        randomBlocksHavingBombs = GameCtrl.getRandomBlocksHavingBombs(level);
        data = GameCtrl.getData();
        UICtrl.addBlocks(data.fieldSize, randomBlocksHavingBombs);
    };
    
    return {
        init: init
    }
}(GameController, UIController));

MainController.init();