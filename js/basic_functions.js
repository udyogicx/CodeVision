/*
Main functions of the program which act abstractly


*/

var msg, algo, obj, result, count, n, variabes, new_algo, func_name, dag={};

function triggerChanges() {
  algo=document.getElementById("algorithm").value;
  //alert(algo.type);
}

function checkRecursive(){
  var i, j, f_name, array = [];
  triggerChanges();
  //obj = JSON.parse(algo);
  var lines=algo.split(";");
  for(i = 0; i<lines.length; i++){
    var rec = lines[i].match(new RegExp("return "+"(.*)"));
    if(rec !=null){
      array.push(rec[1]);
    }
  }
  new_algo = algo;
  for(j = 0; j<array.length; j++){
    var algo_split = new_algo.split("return "+array[j]);
    algo_split[0]=algo_split[0]+"var a = "+array[j]+";";
    new_algo = algo_split.join(" return a");
  }
  //result = eval(new_algo);
  func_name = /^[^\function].[^\(]*/.exec(algo.match(new RegExp("function "+"(.*)"))[1]);
  variables = algo.split(func_name);
  count = variables.length-1;
  if(count>=4){
    msg = "This algorithm is multithreaded recursive.";
  }else if(count==3){
    msg = "This algorithm is recursive.";
  }else{
    msg = "This algorithm is not recursive.";
  }
  display(msg);
}

function generateCDAG(){
  var i, j, algo_sp, nw_algo, split_by_var_a, join_by_var_a, variable_name, num_array, DAG;
  var regExp = /\(([^)]+)\)/;
  checkRecursive();

  if (msg != "This algorithm is not recursive."){
    var parameters = [];
    n = regExp.exec(variables[count])[1];
    variable_name = regExp.exec(variables[1])[1];

    for(i = 0; i < (count - 2); i++){
      parameters.push(regExp.exec(variables[i+2])[1]);
    }
    num_array = "{";
    for(j = 0; j<parameters.length; j++){
      num_array=num_array+"[eval("+parameters[j]+")]:{}, ";
    }
    num_array = num_array.slice(0,num_array.length-2);
    num_array = num_array+"};";
    split_by_var_a = new_algo.split("var a");
    split_by_var_a[split_by_var_a.length-2] = split_by_var_a[split_by_var_a.length-2]+" dag[eval(variable_name)] = "+num_array+" var b = dag; dag = dag[eval(variable_name)]; ";
    join_by_var_a = split_by_var_a.join("var a");
    algo_sp = join_by_var_a.split("return");
    algo_sp[algo_sp.length-2]=algo_sp[algo_sp.length-2]+" dag = b; ";
    algo_sp[algo_sp.length-1]=algo_sp[algo_sp.length-1];
    nw_algo = algo_sp.join("return");
    eval(nw_algo);
    json_read(JSON.stringify(dag), func_name, parameters.length+1);
    dag_create();
  }else{
    display("Cannot generate computation DAG.")
  }
}

function reset(){
  
}

function display(msg) {
  window.alert(msg);
  /*var p = document.createElement('p');
  p.innerHTML = msg;
  document.body.appendChild(p);*/
}