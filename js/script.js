//Condicional para separar las acciones js - según la pagina
if(document.querySelector('#homePage')){
//Cambia palabra del collapse
document.getElementById("seeMore").addEventListener('click',function(){
  var objeto = document.getElementById("seeMore");
  if(objeto.value===1){
    objeto.value=2;
    objeto.innerText="Read More";
  } else {
    objeto.value=1
    objeto.innerText="See Less";
  }
});
//table de Senate
}else if(document.querySelector('#senatePage')){
  loadData("senate",1)
//table de house
}else if(document.querySelector('#housePage')){
  loadData("house",2)
}else if(document.querySelector('#houseAttendance')){
  loadData("house",3)
}else if(document.querySelector('#senateAttendance')){
  loadData("senate",5)
}else if(document.querySelector('#houseLoyalty')){
  loadData("house",4)
}else if(document.querySelector('#senateLoyalty')){
  loadData("senate",6)
}
//Carga de la API y derivasiones
function loadData(cadena,op){
  fetch(`https://api.propublica.org/congress/v1/113/${cadena}/members.json`, {
    headers: {
    'X-API-Key': 'Omyy7ztcAQ8UXPOBD2xO4QsXHuGsVTJNhcDEY9m1' } })
  fetch(`js/pro-congress-113-${cadena}.json`)
  .then(response => response.json())
  .then(data=>{
    switch(true){
      case (op==1||op==2):{loadTable(data.results[0]);agregarDataTables();break}
      //attendance
      case (op==3||op==5):{mainFunction(data.results[0],"attendance");break}
      //loyalty
      case (op==4||op==6):{mainFunction(data.results[0],"loyalty");break}
    }
  })
}
//funciones e tarea 2
function isNull(nombre){
  if(nombre!=null) return nombre
  else return ""
}
function loadTable(direccion){
  for(var i=0;i<direccion.members.length;i++){
    var tabla=document.getElementById('contenidoTabla')
    //Construyendo los td
    //Nombre
    const td=document.createElement('td')
    //validando y guardando el nombre completo
    const nombreCompleto=direccion.members[i].first_name+" "+isNull(direccion.members[i].middle_name)+direccion.members[i].last_name;
    const a=document.createElement('a')
    a.innerText=nombreCompleto
    a.setAttribute('href',direccion.members[i].url)
    a.setAttribute('target',"_blank")
    td.appendChild(a)
    //Party
    const tdParty=document.createElement('td')
    tdParty.innerText=direccion.members[i].party
    //State
    const tdState=document.createElement('td')
    tdState.innerText=direccion.members[i].state
    //Years in office
    const tdYears=document.createElement('td')
    tdYears.innerText=direccion.members[i].seniority
    //Votes / party
    const tdVotesParty=document.createElement('td')
    tdVotesParty.innerText=direccion.members[i].votes_with_party_pct.toFixed(2)+" %"
    //Añadiento datos al TR
    const tr=document.createElement('tr')
    tr.appendChild(td)
    tr.appendChild(tdParty)
    tr.appendChild(tdState)
    tr.appendChild(tdYears)
    tr.appendChild(tdVotesParty)
    //TR a la tabla
    tabla.appendChild(tr)
  }
}
//funciones tarea 3
//Attendance and Party
function mainFunction(data,attendanceOrLoyalty){
  //Usando una funcion para guardar en un objeto statistics según los datos a usar
  var statistics=statisticsIdentifyAtLoyal(data,attendanceOrLoyalty)
  //Mostrando los datos
  viewDatesTable(statistics,attendanceOrLoyalty)
}
function statisticsIdentifyAtLoyal(data,attendanceOrLoyalty){
   //creando objeto para guardar los calculos solicitados
   var statistics={
    "cantD":0,
    "cantR":0,
    "cantI":0,
    "votesPorcentWithPartyD":0,
    "votesPorcentWithPartyR":0,
    "votesPorcentWithPartyI":0,
    "members":[]
  }
  data.members.map(member=>{
    //guardando datos
    switch(true){
      case (member.party==="D"):{
        statistics.cantD++
        statistics.votesPorcentWithPartyD+=member.votes_with_party_pct
        statistics.members.push(memberToObject(member,attendanceOrLoyalty))
        break
      }
      case (member.party==="R"):{
        statistics.cantR++
        statistics.votesPorcentWithPartyR+=member.votes_with_party_pct
        statistics.members.push(memberToObject(member,attendanceOrLoyalty))
        break
      }
      case (member.party==="ID"):{
        statistics.cantI++
        statistics.votesPorcentWithPartyI+=member.votes_with_party_pct
        statistics.members.push(memberToObject(member,attendanceOrLoyalty))
        break
      }
    }
  })
  return statistics
}
//Realizando un objeto y retornandolo
function memberToObject(member,attendanceOrLoyalty){
  var mem={
    name:"",
    party:"",
    numberVotesWithParty:0,
    porcentVotesWithParty:0,
    totalVotes:0
  }
  if(attendanceOrLoyalty=="attendance"){
    mem.nMissedVotes=member.missed_votes
    mem.porcentMissed=((member.missed_votes*100)/member.total_votes).toFixed(2)
  }else{
    mem.numberVotesWithParty=(member.votes_with_party_pct*member.total_votes)/100,
    mem.porcentVotesWithParty=member.votes_with_party_pct
  }
  mem.name=(member.first_name+" "+isNull(member.middle_name)+member.last_name)
  mem.party=member.party
  mem.totalVotes=member.total_votes
  return mem
}
function viewDatesTable(statistics,attendanceOrLoyalty){
  //tomando las tablas
  tablePartys=document.querySelector('#tablePartys')
  tableLess=document.querySelector('#tableLess')
  tableMost=document.querySelector('#tableMost')
  //Llenando tabla Partys
  var partys=["Republican","Democrat","Independent"]
  viewTablePartys(partys,statistics,tablePartys)
  //Tables Less and More
  var dataTableLess=dataTables(statistics,"less",attendanceOrLoyalty)
  var dataTableMore=dataTables(statistics,"more",attendanceOrLoyalty)
  //Llenando tablas Less and More
  viewTablesMoreOrLess(dataTableLess,tableLess,attendanceOrLoyalty)
  viewTablesMoreOrLess(dataTableMore,tableMost,attendanceOrLoyalty)
}
//funciones tablas Attendance & Loyalty
function viewTablePartys(partys,statistics,tablePartys){
  for(var i=0;i<partys.length;i++){
    var tr=document.createElement('tr')
    var tdParty=document.createElement('td')
    tdParty.innerHTML=partys[i]
    var party=("Republican"==partys[i]) ? "R" : ("Democrat"==partys[i]) ? "D" : ("Independent"==partys[i]) ? "I" : "NULL"
    var tdNumber=document.createElement('td')
    tdNumber.innerHTML=statistics["cant"+party]
    var tdPorcent=document.createElement('td')
    tdPorcent.innerHTML=(statistics["votesPorcentWithParty"+party]/((statistics["cant"+party])==0 ? 1 : (statistics["cant"+party]).toFixed(2))).toFixed(2)+" %"
    //appendiando
    tr.appendChild(tdParty)
    tr.appendChild(tdNumber)
    tr.appendChild(tdPorcent)
    tablePartys.appendChild(tr)
  }
  var tr=document.createElement('tr')
  var tdTotal=document.createElement('td')
  var tdTotalCant=document.createElement('td')
  tdTotal.innerHTML="Total"
  tdTotalCant.innerHTML=statistics.members.length
  tr.appendChild(tdTotal)
  tr.appendChild(tdTotalCant)
  tablePartys.appendChild(tr)
}
function dataTables(statistics,moreOrLess,attendanceOrLoyalty){
  var statisticsResult=[]
  //statistics.members=filtro(statistics.members)
  //Si la funcion es llamada desde una pagina Attendance entra al if, si no else
  if(attendanceOrLoyalty=="attendance"){  
    var statisticsFiltrado=filtrado(statistics)
    //ordena el objeto de mayor a menor o viceersa, segun el parametro moreOrLess
    moreOrLess=="less" ? (statisticsFiltrado.sort((a,b)=>b.porcentMissed-a.porcentMissed)) : (statisticsFiltrado.sort((a,b)=>a.porcentMissed-b.porcentMissed))
    for(var i=0;i<Math.ceil(statisticsFiltrado.length*.10);i++){
      member={
        name:"",
        nMissedVotes:0,
        porcentMissed:0,
      }
      member.name=statisticsFiltrado[i].name
      member.nMissedVotes=statisticsFiltrado[i].nMissedVotes
      member.porcentMissed=statisticsFiltrado[i].porcentMissed+" %"
      statisticsResult.push(member)
    }
  }else{
    //ordena el objeto de mayor a menor o viceersa, segun el parametro moreOrLess
    var statisticsFiltrado=filtrado(statistics)
    moreOrLess=="less" ? (statisticsFiltrado.sort((a,b)=>a.porcentVotesWithParty-b.porcentVotesWithParty)) : (statisticsFiltrado.sort((a,b)=>b.porcentVotesWithParty-a.porcentVotesWithParty))
        for(var i=0;i<Math.ceil(statisticsFiltrado.length*.10);i++){
      member={
        name:"",
        numberVotesWithParty:0,
        porcentVotesWithParty:0,
      }
      member.name=statisticsFiltrado[i].name
      member.numberVotesWithParty=statisticsFiltrado[i].numberVotesWithParty.toFixed(0)
      member.porcentVotesWithParty=statisticsFiltrado[i].porcentVotesWithParty.toFixed(2)+" %"
      statisticsResult.push(member)
    }
  }
  return statisticsResult
}
//filtro
function filtrado(statistics){
  var statisticsFiltrado=[]
  for(var i=0;i<statistics.members.length;i++){
    if(statistics.members[i].totalVotes==0)continue
      else statisticsFiltrado.push(statistics.members[i])
  }
  return statisticsFiltrado
}
function viewTablesMoreOrLess(dataTable,tableMoreOrLess,attendanceOrLoyalty){
  dataTable.map(property=>{
    var tr=document.createElement('tr')
    var tdName=document.createElement('td')
    tdName.innerHTML=property.name
    var tdDataTwo=document.createElement('td')
    var tdDataThree=document.createElement('td')
    if(attendanceOrLoyalty=="attendance"){
      tdDataTwo.innerHTML=property.nMissedVotes
      tdDataThree.innerHTML=property.porcentMissed
    }else{
      tdDataTwo.innerHTML=property.numberVotesWithParty
      tdDataThree.innerHTML=property.porcentVotesWithParty
    }
    //appendiando
    tr.appendChild(tdName)
    tr.appendChild(tdDataTwo)
    tr.appendChild(tdDataThree)
    tableMoreOrLess.appendChild(tr)
  })
}
/*
function filtro(member){
  var entradasInvalidas = 0;
  var cont1=0
  var cont2=0
  console.log(member)
  member.map((mem,i)=>{
    console.log(filtrarPorTotalVotes(mem,cont1,cont2))
  })
  console.log('Array Filtrado\n', );
  console.log('Número de Entradas Invalidas = ', entradasInvalidas);
  // Si el elemento tiene un atributo totalVotes, y su valor correspondiente es un numero
  // Y no es el valor NaN, entonces es una entrada válida
  function filtrarPorTotalVotes(member) {
    console.log(member)
    if ('totalVotes' in member && typeof(member.totalVotes) === 'number' && !isNaN(member.totalVotes)) {
      cont1++
      console.log(cont1)
      return true;
    } else {
      cont2++
      console.log(cont2)

      entradasInvalidas++;
      return false;
    }
  }

}*/

//datatables
function agregarDataTables(){
  $(document).ready( function () {
    $('#table').DataTable();
  } );
}