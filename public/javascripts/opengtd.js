var globDebug;
var globDebug_oRecord;
var globDebug_sData;

var tasksDataTable;

var DDM     = YAHOO.util.DragDropMgr;
var Event   = YAHOO.util.Event;
var DTDrags = {};

var DDRows = function(id, sGroup, config) {
    DDRows.superclass.constructor.call(this, id, sGroup, config);
    YAHOO.util.Dom.addClass(this.getDragEl(),"custom-class");
    this.goingUp = false;
    this.lastY = 0;
};

document.observe("dom:loaded", init );

function init() {
  YAHOO.extend(DDRows, YAHOO.util.DDProxy, {
    proxyEl: null,
    srcEl:null,
    srcData:null,
    srcIndex: null,
    tmpIndex:null,

    startDrag: function(x, y) {
        var proxyEl = this.proxyEl = this.getDragEl(),
            srcEl = this.srcEl = this.getEl();
        this.srcData = tasksDataTable.getRecord(this.srcEl).getData();
        this.srcIndex = srcEl.sectionRowIndex;
        // Make the proxy look like the source element
        YAHOO.util.Dom.setStyle(srcEl, "visibility", "hidden");
        proxyEl.innerHTML = "<table><tbody>"+srcEl.innerHTML+"</tbody></table>";
    },
    endDrag: function(x,y) {
      var position, srcEl = this.srcEl;
      YAHOO.util.Dom.setStyle(this.proxyEl, "visibility", "hidden");
      YAHOO.util.Dom.setStyle(srcEl, "visibility", "");
      
      var folder = $$('#sidebar a.drag-over').first().id.gsub('sidebar-','');
      var taskID = this.srcData.id;

      dropTaskInto(taskID,folder);    
      
      $$('#sidebar a').each(function(e){ e.removeClassName('drag-over'); });
    },
    onDrag: function(e) {
      // Keep track of the direction of the drag for use during onDragOver
      var y = Event.getPageY(e);

      if (y < this.lastY) {
        this.goingUp = true;
      } else if (y > this.lastY) {
        this.goingUp = false;
      }

      this.lastY = y;
    },
    onDragOver: function(e, id) {
      // Reorder rows as user drags
      var srcIndex = this.srcIndex,
          destEl = YAHOO.util.Dom.get(id),
          destIndex = destEl.sectionRowIndex,
          tmpIndex = this.tmpIndex;

      if (destEl.nodeName.toLowerCase() === "tr") {
        if(tmpIndex !== null) {
            tasksDataTable.deleteRow(tmpIndex);
        } else {
            tasksDataTable.deleteRow(this.srcIndex);
        }
        tasksDataTable.addRow(this.srcData, destIndex);
        this.tmpIndex = destIndex;
        DDM.refreshCache();
      } else {
        $$('#sidebar a').each(function(e){ e.removeClassName('drag-over'); });
        $(destEl.id).addClassName('drag-over');
      }
    }
  });
  
  initializeSideBarDragTargets();
  initializeSideBarLinks();
  loadDataTable();
  
  $('new-task').observe('submit',addTask);
}

function initializeSideBarLinks() {
  $$('#sidebar a').each(function(e){ e.observe('click', changeView ); });
}

function changeView(e) {
  e.stop();
  $$('#sidebar a').each(function(e){ e.removeClassName('selected'); });
  this.addClassName('selected');
  if(this.id=='sidebar-today') {
    reloadDataTable('/due_today');
  }
}

function dropTaskInto(taskID,folder) {
  if(folder=='someday') {
    tagTaskAs(taskID,'someday',function(){});
  }
  if(folder=='today') {
    var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();    
    makeTaskDueOn(taskID,month,day,year,function(){});
  }
}

function makeTaskDueOn(taskID,month,day,year,callback) {
  new Ajax.Request( '/v1/tasks/'+taskID+'/make_due_on/'+month+'/'+day+'/'+year, {
    method: 'post',
    parameters: {},
    onSuccess: callback
  });
}

function tagTaskAs(task_id,tag,callback) {
  new Ajax.Request( '/v1/tasks/'+task_id+'/tags/add', {
    method: 'post',
    parameters: { tag: tag },
    onSuccess: callback
  });
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
    onSuccess: function(transport) { 
      reloadDataTable();
      $('#new-task textarea').value = '';
    }
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
    { key:'completed', label: '', sortable: false, formatter: formatCheckbox, width: 20, maxAutoWidth: 20, minWidth: 20 },
    { key:'title', label: 'Task Summary', sortable: true, editor: new YAHOO.widget.TextareaCellEditor() }
  ];
}

function dataTableJSONResponseSchema() {
  return { 
    resultsList: 'tasks',
    fields: [ 'id', 'title', 'user_id', 'completed', 'tags', 'notes', { key:'due_on', parser:'date' }, { key:'created_at', parser:'date' }, { key:'updated_at', parser:'date' } ]
  };
}

function dataTableDataSource() {
  var dataSource            = new YAHOO.util.DataSource("/v1/tasks");
  dataSource.responseType   = YAHOO.util.DataSource.TYPE_JSON;
  dataSource.connXhrMode    = "queueRequests";
  dataSource.responseSchema = dataTableJSONResponseSchema();
  return dataSource;
}

function reloadDataTable(request) {
  if(request==null) request = '';
  tasksDataTable.showTableMessage("Loading...");
  tasksDataTable.getDataSource().sendRequest(request, { success: tasksDataTable.onDataReturnInitializeTable, scope: tasksDataTable });
}

function initializeSideBarDragTargets() {
  $$('#sidebar a').each(function(e){
    new YAHOO.util.DDTarget(e.id);
  });
}

function onCellEdit(oArgs) { 
  var oColumn  = oArgs.editor.getColumn();
  var column   = oColumn.getKey();
  var oRecord  = oArgs.editor.getRecord();
  var newValue = oRecord.getData(column);
  var row      = this.getRecord(oArgs.target);
  var task     = oRecord._oData;
  
  var task_parameters = {};
  for (var key in task) {
    if (task.hasOwnProperty(key)) {
      task_parameters['task['+key+']'] = task[key];
    }
  }
  
  new Ajax.Request( '/v1/tasks/'+task.id, {
    method: 'put',
    parameters: task_parameters
  });
}

function loadDataTable() {
  $('tasks').update();
  tasksDataTable = new YAHOO.widget.DataTable( 'tasks', dataTableColumns(), dataTableDataSource(), { initialRequest: '' } );
  tasksDataTable.subscribe( 'postRenderEvent', setUpBehaviors );
  tasksDataTable.subscribe( 'cellDblclickEvent', tasksDataTable.onEventShowCellEditor);
  tasksDataTable.subscribe( 'editorSaveEvent', onCellEdit );
  tasksDataTable.subscribe( 'initEvent', function() {
    var i, id, allRows = this.getTbodyEl().rows;

    for(i=0; i<allRows.length; i++) {
      id = allRows[i].id;
      // Clean up any existing Drag instances
      if (DTDrags[id]) {
        DTDrags[id].unreg();
        delete DTDrags[id];
      }
      // Create a Drag instance for each row
      DTDrags[id] = new DDRows(id);
    }
  });
  tasksDataTable.subscribe("rowAddEvent",function(e){
      var id = e.record.getId();
      DTDrags[id] = new DDRows(id);
  });
}
