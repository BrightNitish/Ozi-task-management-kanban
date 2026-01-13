import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import NewTaskModal from '../components/NewTaskModal';
import axios from 'axios'; // 1. Import Axios

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // 2. Initialize Empty State (Instead of dummy data)
  const [data, setData] = useState({
    tasks: {},
    columns: {
      'todo': { id: 'todo', title: 'To Do', taskIds: [] },
      'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
      'done': { id: 'done', title: 'Done', taskIds: [] },
    },
    columnOrder: ['todo', 'in-progress', 'done'],
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3. FETCH DATA on Component Mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // call your backend API
      const res = await axios.get('http://localhost:5000/api/tasks');
      const tasksFromDB = res.data;

      // Transform Backend Array -> Frontend Object Structure
      const newTasks = {};
      const newColumns = {
        'todo': { id: 'todo', title: 'To Do', taskIds: [] },
        'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
        'done': { id: 'done', title: 'Done', taskIds: [] },
      };

      tasksFromDB.forEach((task) => {
        // Map MongoDB _id to frontend id
        newTasks[task._id] = { 
          id: task._id, 
          content: task.title, 
          tag: task.tag 
        };
        // Push ID into the correct column based on status
        if (newColumns[task.status]) {
            newColumns[task.status].taskIds.push(task._id);
        }
      });

      setData({
        tasks: newTasks,
        columns: newColumns,
        columnOrder: ['todo', 'in-progress', 'done'],
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  // 4. ADD TASK (Connect to POST /api/tasks)
  const addTask = async (taskData) => {
    try {
      await axios.post('http://localhost:5000/api/tasks', {
        title: taskData.title,
        tag: taskData.tag,
        status: 'todo' // Default status
      });
      // Refresh data to see the new task
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task");
    }
  };

  // 5. DRAG END (Connect to PUT /api/tasks/:id)
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // --- Optimistic UI Update (Update screen first) ---
    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Case 1: Reordering in same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      setData((prev) => ({
        ...prev,
        columns: { ...prev.columns, [newColumn.id]: newColumn },
      }));
      return; // No backend update needed for reorder (unless you added an 'order' field in DB)
    }

    // Case 2: Moving to different column
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, taskIds: finishTaskIds };

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));

    // --- Backend Update (Send new status to DB) ---
    try {
      await axios.put(`http://localhost:5000/api/tasks/${draggableId}`, {
        status: destination.droppableId // 'todo', 'in-progress', or 'done'
      });
    } catch (error) {
      console.error("Error updating status:", error);
      // Optional: Revert changes if API fails
    }
  };

  //DELETE TASK
  // 6. DELETE TASK (DELETE API)
  const deleteTask = async (taskId) => {
    if(!window.confirm("Are you sure you want to delete this task?")) return;

    // Optimistic Update: Remove from UI immediately
    const newTasks = { ...data.tasks };
    delete newTasks[taskId];

    const newColumns = { ...data.columns };
    
    // Remove task ID from every column
    for (const colId in newColumns) {
      newColumns[colId].taskIds = newColumns[colId].taskIds.filter(id => id !== taskId);
    }

    setData(prev => ({
      ...prev,
      tasks: newTasks,
      columns: newColumns
    }));

    // Call Backend
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
      // Optional: Refresh from server if it failed
      fetchTasks();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
       <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-6">
          <h1 className="text-2xl font-bold text-indigo-600 mb-8">OziKanban</h1>
          <div className="mt-auto">
             <div className="p-3 bg-indigo-50 rounded text-indigo-800 text-sm font-medium mb-4">
               {user?.email}
             </div>
             <button onClick={handleLogout} className="text-red-500 text-sm font-bold hover:underline">Logout</button>
          </div>
       </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">My Project Board</h2>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2"
          >
            <span>+</span> New Task
          </button>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto bg-gray-50 p-6">
            <div className="flex h-full gap-6">
              {data.columnOrder.map((columnId) => {
                const column = data.columns[columnId];
                const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

                return (
                  <div key={column.id} className="w-80 flex flex-col shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-700">{column.title}</h3>
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{tasks.length}</span>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex-1 flex flex-col gap-3 rounded-xl p-2 transition ${
                            snapshot.isDraggingOver ? 'bg-indigo-50 border-2 border-dashed border-indigo-300' : ''
                          }`}
                        >
                          {tasks.map((task, index) => (
  /* 1. RESTORE THE DRAGGABLE WRAPPER */
  <Draggable key={task.id} draggableId={task.id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`bg-white p-4 rounded-xl border shadow-sm group relative ${
          snapshot.isDragging ? 'shadow-2xl rotate-2 ring-2 ring-indigo-500' : 'border-gray-200 hover:shadow-md'
        }`}
        style={{ ...provided.draggableProps.style }}
      >
        {/* DELETE BUTTON */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>

        {/* CARD CONTENT */}
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-bold px-2 py-1 rounded ${
              task.tag === 'High' ? 'bg-red-100 text-red-700' : 
              task.tag === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {task.tag ? task.tag.toUpperCase() : 'LOW'}
          </span>
        </div>
        <h4 className="font-semibold text-gray-800 pr-6">{task.content}</h4>
      </div>
    )}
  </Draggable>
))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </div>
        </DragDropContext>
      </main>

      <NewTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={addTask} 
      />
    </div>
  );
};

export default Dashboard;