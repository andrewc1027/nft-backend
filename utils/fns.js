/**
 * Сгенерировать для массива все варианты перестановок его элементов
 */
function arrayCombinator(arr) {
  if (arr.length > 1) {
      var beg = arr[0];
      var arr1 = arrayCombinator(arr.slice(1));
      var arr2 = [];
      var l =  arr1[0].length;
      for(var i=0; i < arr1.length; i++) 
          for(var j=0; j <= l; j++) 
              arr2.push(arr1[i].slice(0, j).concat(beg, arr1[i].slice(j)));
      return arr2;
  } else return [arr];
}

module.exports = {
  arrayCombinator: arrayCombinator
};