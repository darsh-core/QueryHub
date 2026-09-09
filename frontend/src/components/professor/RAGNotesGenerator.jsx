import React, { useState, useEffect } from 'react';
import { modulesApi, ragApi, quizApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Sparkles, FileText, CheckCircle2, Sliders, Send } from 'lucide-react';

export const RAGNotesGenerator = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [topic, setTopic] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [strictness, setStrictness] = useState('Moderate');
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [generatingAssignment, setGeneratingAssignment] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [generatedAssignment, setGeneratedAssignment] = useState(null);
  const [publishStatus, setPublishStatus] = useState('');

  useEffect(() => {
    modulesApi.getAll().then((res) => {
      setModules(res.data);
      if (res.data.length > 0) {
        setSelectedModule(res.data[0].id.toString());
      }
    });
  }, []);

  const handleGenerateNotes = async () => {
    if (!topic || !selectedModule) {
      alert('Please enter a topic and select a module.');
      return;
    }
    setGeneratingNotes(true);
    try {
      const res = await ragApi.generateNotes(selectedModule, topic);
      setGeneratedNotes(res.data);
    } catch (err) {
      alert('Failed to generate RAG notes');
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleGenerateAssignment = async () => {
    if (!topic || !selectedModule) {
      alert('Please enter a topic and select a module.');
      return;
    }
    setGeneratingAssignment(true);
    try {
      const res = await ragApi.generateAssignment(selectedModule, topic, 3);
      setGeneratedAssignment(res.data);
    } catch (err) {
      alert('Failed to generate assignment');
    } finally {
      setGeneratingAssignment(false);
    }
  };

  const handlePublishQuiz = async () => {
    if (!generatedAssignment) return;
    try {
      await quizApi.create({
        module_id: parseInt(selectedModule),
        title: generatedAssignment.title,
        description: `RAG-generated assignment on ${generatedAssignment.topic}`,
        questions: generatedAssignment.questions,
        temperature: temperature,
        strictness: strictness
      });
      setPublishStatus('Quiz published successfully! Students can now take this assessment.');
    } catch (err) {
      alert('Failed to publish quiz');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-lms-dark">RAG Knowledge Base & Quiz Rubric Builder</h2>
        <p className="text-xs text-lms-taupe">Query vector stores to generate study guides, assignment sets, and configure Llama 3.1 evaluation temperature</p>
      </div>

      <Card title="RAG Tooling & Rubric Configuration">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-lms-dark mb-1">Target Course Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-lms-bg border border-lms-border rounded-lg text-lms-dark focus:outline-none focus:ring-2 focus:ring-lms-taupe"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.code}: {m.title}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-lms-dark mb-1">Topic / Vector Query Focus</label>
            <input
              type="text"
              placeholder="e.g. Gradient Descent, State Space Search, ACID Transactions"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-lms-bg border border-lms-border rounded-lg text-lms-dark focus:outline-none focus:ring-2 focus:ring-lms-taupe"
            />
          </div>
        </div>

        {/* Llama 3.1 Rubric Builder Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-lms-border/60 bg-lms-surface/50 p-3 rounded-xl border">
          <div>
            <label className="block text-xs font-bold text-lms-dark mb-1 flex items-center justify-between">
              <span>Llama 3.1 Evaluation Temperature ({temperature})</span>
              <Sliders className="w-3.5 h-3.5 text-lms-sand" />
            </label>
            <input 
              type="range" 
              min="0.0" 
              max="1.0" 
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-lms-dark"
            />
            <p className="text-[10px] text-lms-taupe mt-0.5">Lower temperature (0.1 - 0.3) ensures strictly deterministic rubric grading.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-lms-dark mb-1">Feedback Strictness Level</label>
            <select
              value={strictness}
              onChange={(e) => setStrictness(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-lms-bg border border-lms-border rounded-lg text-lms-dark"
            >
              <option value="Strict">Strict (High penalty for missing keywords)</option>
              <option value="Moderate">Moderate (Standard academic evaluation)</option>
              <option value="Lenient">Lenient (Generous conceptual partial credit)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-lms-border/60">
          <Button onClick={handleGenerateNotes} disabled={generatingNotes || !topic} icon={Sparkles}>
            {generatingNotes ? 'Retrieving Vector Context & Generating...' : 'Generate RAG Study Notes'}
          </Button>
          <Button variant="secondary" onClick={handleGenerateAssignment} disabled={generatingAssignment || !topic} icon={FileText}>
            {generatingAssignment ? 'Synthesizing Assignment...' : 'Generate Assignment via RAG'}
          </Button>
        </div>
      </Card>

      {/* Display Generated Notes */}
      {generatedNotes && (
        <Card title={`Generated RAG Study Notes: ${generatedNotes.topic}`} subtitle="Published automatically to student dashboard">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {generatedNotes.key_terms.map((term, i) => (
                <Badge key={i} variant="sand">#{term}</Badge>
              ))}
            </div>

            <div className="p-4 bg-lms-bg rounded-xl space-y-4 border border-lms-border/50">
              {generatedNotes.sections.map((sec, i) => (
                <div key={i}>
                  <h4 className="text-sm font-bold text-lms-dark mb-1">{sec.heading}</h4>
                  <p className="text-xs text-lms-dark whitespace-pre-line leading-relaxed">{sec.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Display Generated Assignment */}
      {generatedAssignment && (
        <Card title={generatedAssignment.title} subtitle={`Total Max Score: ${generatedAssignment.max_score} Points`}>
          <div className="space-y-4">
            {generatedAssignment.questions.map((q, idx) => (
              <div key={idx} className="p-4 bg-lms-bg border border-lms-border/60 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold text-lms-dark">Question {idx + 1} ({q.max_score} pts)</p>
                  <Badge variant="sand">{q.type || 'Short Answer'}</Badge>
                </div>
                <p className="text-sm text-lms-dark font-medium">{q.question}</p>
                
                {q.options && (
                  <div className="text-xs text-lms-taupe font-mono pl-2">
                    Options: {q.options.join(', ')}
                  </div>
                )}

                <div className="text-xs text-lms-taupe bg-white/60 p-2.5 rounded-lg border border-lms-border/40">
                  <p><span className="font-bold text-lms-dark">Master Answer Key:</span> {q.ideal_answer}</p>
                  <p className="mt-1"><span className="font-bold text-lms-dark">Grading Rubric:</span> {q.rubric}</p>
                </div>
              </div>
            ))}

            {publishStatus && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{publishStatus}</span>
              </div>
            )}

            <Button onClick={handlePublishQuiz} icon={Send} className="w-full">
              Publish Quiz to Student Portal
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
