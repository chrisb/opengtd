var globDebug;
var globDebug_oRecord;
var globDebug_sData;
var tasksDataTable;

document.observe("dom:loaded", init );

function init() {
  loadDataTable();
  $('new-task').observe('submit',addTask);
}

function formatCheckbox(elCell, oRecord, oColumn, sData) {
  var checkedState = oRecord.getData('completed') ? 'checked' : '';
  elCell.innerHTML = "<input type='checkbox' data-id='"+oRecord.getData('id')+"' "+checkedState+" class='task'>";
};

function addTask(e) {
  e.stop(); // stop the form from submitting
  new Ajax.Request( '/v1/tasks/create', {
    method: 'post',
    parameters: $('new-task').serialize(true),
    onSuccess: function(transport) { reloadDataTable(); }
  });
}

function setUpBehaviors() {
  $$('input[type=checkbox].task').each(function(e){
    if(e.getAttribute('data-id')=='$id') return;
    e.observe('click',toggleCompletion);
  });
}

function toggleCompletion() {
  var taskID = this.getAttribute('data-id');
  var action = this.checked ? 'complete' : 'reset';
  new Ajax.Request( '/v1/tasks/'+taskID+'/'+action, {
    method: 'post'
  });
}

function dataTableColumns() {
  return [
    { key:'completed', label: '', sortable: false, formatter: formatCheckbox, width: 10, maxAutoWidth: 10, minWidth: 10 },
    { key:'title', label: 'Task Summary', sortable: true }
  ];
}

function dataTableJSONResponseSchema() {
  return { 
    resultsList: 'tasks',
    fields: [ 'id', 'title', 'user_id', 'completed', 'tags', 'notes', 'due_on', 'created_at', 'updated_at' ]
  };
}

function dataTableDataSource() {
  var dataSource            = new YAHOO.util.DataSource("/v1/tasks");
  dataSource.responseType   = YAHOO.util.DataSource.TYPE_JSON;
  dataSource.connXhrMode    = "queueRequests";
  dataSource.responseSchema = dataTableJSONResponseSchema();
  return dataSource;
}

function reloadDataTable() {
  tasksDataTable.showTableMessage("Loading...");
  tasksDataTable.getDataSource().sendRequest('', { success: tasksDataTable.onDataReturnInitializeTable, scope: tasksDataTable });
}

function loadDataTable() {
  $('tasks').update();
  tasksDataTable = new YAHOO.widget.DataTable( 'tasks', dataTableColumns(), dataTableDataSource(), { initialRequest: '' } );
  tasksDataTable.subscribe( 'postRenderEvent', setUpBehaviors );
}