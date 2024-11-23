import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Users, 
  DollarSign, 
  Target, 
  Clock, 
  Calendar,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Settings,
  PieChart,
  Sparkles,
  Plus,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { TaskDialog } from './TaskDialog';

const NodeDetailsPanel = ({ node, onUpdate }) => {
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(node?.description || '');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleDescriptionUpdate = () => {
    onUpdate({
      ...node,
      description
    });
    setIsEditingDescription(false);
  };

  const handleTaskSave = (task) => {
    const updatedTasks = [...(node.tasks || [])];
    const existingIndex = updatedTasks.findIndex(t => t.id === task.id);
    
    if (existingIndex >= 0) {
      updatedTasks[existingIndex] = task;
    } else {
      updatedTasks.push({ ...task, id: Date.now().toString() });
    }

    onUpdate({
      ...node,
      tasks: updatedTasks
    });
    setShowTaskDialog(false);
    setEditingTask(null);
  };

  const handleTaskDelete = (taskId) => {
    onUpdate({
      ...node,
      tasks: (node.tasks || []).filter(t => t.id !== taskId)
    });
  };

  if (!node) return null;

  return (
    <div className="w-full bg-card text-card-foreground rounded-lg shadow-xl">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">{node.name}</h2>
        </div>
        <Badge variant={
          node.status === 'on-track' ? 'success' :
          node.status === 'at-risk' ? 'warning' : 'danger'
        }>
          <div className="flex items-center gap-1">
            {node.status === 'on-track' ? <CheckCircle2 className="h-4 w-4" /> :
             node.status === 'at-risk' ? <AlertCircle className="h-4 w-4" /> :
             <XCircle className="h-4 w-4" />}
            <span className="capitalize">{node.status}</span>
          </div>
        </Badge>
      </div>

      <div className="p-4 space-y-6">
        {/* Description Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Description</label>
            </div>
            <button
              onClick={() => {
                if (isEditingDescription) {
                  handleDescriptionUpdate();
                } else {
                  setIsEditingDescription(true);
                }
              }}
              className="text-xs text-primary hover:text-primary/90"
            >
              {isEditingDescription ? 'Save' : 'Edit'}
            </button>
          </div>
          {isEditingDescription ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 px-3 py-2 text-sm bg-muted/10 rounded-md border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter description..."
            />
          ) : (
            <p className="text-sm text-muted-foreground">{description || 'No description provided.'}</p>
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Progress</label>
            </div>
            <button
              onClick={() => setIsEditingProgress(!isEditingProgress)}
              className="text-xs text-primary hover:text-primary/90"
            >
              {isEditingProgress ? 'Save' : 'Edit'}
            </button>
          </div>
          {isEditingProgress ? (
            <Slider
              defaultValue={[node.progress]}
              max={100}
              step={1}
              onValueChange={(value) => {
                onUpdate({
                  ...node,
                  progress: value[0]
                });
              }}
              className="w-full"
            />
          ) : (
            <Progress value={node.progress} className="h-2" />
          )}
          <span className="text-sm text-muted-foreground">{node.progress}% Complete</span>
        </div>

        {/* Tasks Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Tasks</label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingTask(null);
                setShowTaskDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
          <div className="space-y-2">
            {(node.tasks || []).map((task) => (
              <div
                key={task.id}
                className="bg-muted/10 p-3 rounded-lg space-y-2"
                onClick={() => {
                  setEditingTask(task);
                  setShowTaskDialog(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{task.title}</span>
                  <Badge variant={
                    task.status === 'completed' ? 'success' :
                    task.status === 'in-progress' ? 'warning' : 'secondary'
                  }>
                    {task.status}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
                <Progress value={task.progress || 0} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Budget Section */}
        {(node.budget || node.spent) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Budget Overview</label>
              </div>
              <button
                onClick={() => setIsEditingBudget(!isEditingBudget)}
                className="text-xs text-primary hover:text-primary/90"
              >
                {isEditingBudget ? 'Save' : 'Edit'}
              </button>
            </div>
            <div className="bg-muted/10 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    Budget
                  </div>
                  <div className="text-lg font-semibold">${(node.budget / 1000).toFixed(0)}k</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <BarChart2 className="h-4 w-4 text-amber-500" />
                    Spent
                  </div>
                  <div className="text-lg font-semibold">${(node.spent / 1000).toFixed(0)}k</div>
                </div>
              </div>
              {isEditingBudget ? (
                <Slider
                  defaultValue={[node.spent]}
                  max={node.budget}
                  step={1000}
                  onValueChange={(value) => {
                    onUpdate({
                      ...node,
                      spent: value[0]
                    });
                  }}
                  className="w-full"
                />
              ) : (
                <Progress value={(node.spent / node.budget) * 100} className="h-1.5" />
              )}
              <div className="text-xs text-right text-muted-foreground mt-1">
                {Math.round((node.spent / node.budget) * 100)}% utilized
              </div>
            </div>
          </div>
        )}

        {/* Status Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Status</label>
            </div>
            <button
              onClick={() => setIsEditingStatus(!isEditingStatus)}
              className="text-xs text-primary hover:text-primary/90"
            >
              {isEditingStatus ? 'Cancel' : 'Change'}
            </button>
          </div>
          {isEditingStatus && (
            <div className="space-y-1">
              {['on-track', 'at-risk', 'delayed'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onUpdate({
                      ...node,
                      status
                    });
                    setIsEditingStatus(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded ${
                    node.status === status ? 'bg-accent' : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {status === 'on-track' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                     status === 'at-risk' ? <AlertCircle className="h-4 w-4 text-amber-500" /> :
                     <XCircle className="h-4 w-4 text-rose-500" />}
                    <span className="capitalize">{status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Team Members */}
        {node.team && node.team.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Team Members</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {node.team.map((member, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted/10 p-2 rounded">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">{member}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPIs */}
        {node.kpis && node.kpis.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Key Performance Indicators</span>
            </div>
            <div className="space-y-3">
              {node.kpis.map((kpi, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">{kpi.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium">{kpi.target}</span>
                    </div>
                  </div>
                  <Progress
                    value={(parseFloat(kpi.current) / parseFloat(kpi.target.replace('%', ''))) * 100}
                    className="h-1.5"
                  />
                  <div className="text-right text-xs text-muted-foreground">
                    Current: {kpi.current}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risks */}
        {node.risks && node.risks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Risk Assessment</span>
            </div>
            <div className="space-y-2">
              {node.risks.map((risk, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted/10 p-2 rounded">
                  <AlertTriangle 
                    className={`h-4 w-4 ${
                      risk.severity === 'high' ? 'text-rose-500' : 
                      risk.severity === 'medium' ? 'text-amber-500' : 
                      'text-blue-500'
                    }`}
                  />
                  <span className="text-sm">{risk.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {node.timeline?.milestones && node.timeline.milestones.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Timeline</span>
            </div>
            <div className="space-y-2">
              {node.timeline.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3 bg-muted/10 p-2 rounded">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-sm">{milestone.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(milestone.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        task={editingTask}
        node={node}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default NodeDetailsPanel;