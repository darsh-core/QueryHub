import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import courselogo from '../../assets/courselogo.png';

export const FeaturedCourseCard = () => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/course/dbms')}
      className="bg-lms-surface border border-lms-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col md:flex-row"
    >
      {/* Course Thumbnail Cover */}
      <div className="w-full md:w-2/5 relative overflow-hidden bg-lms-dark min-h-[220px] flex items-center justify-center p-4">
        <img 
          src={courselogo} 
          alt="Database Management Systems Course" 
          className="w-full h-full max-h-56 object-contain rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Course Details */}
      <div className="w-full md:w-3/5 p-6 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant="sand">CS-501</Badge>
            <span className="text-[11px] text-lms-taupe font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-lms-sand" /> Qwen 3.2 Evaluation
            </span>
          </div>

          <h3 className="text-xl font-bold text-lms-dark group-hover:text-lms-taupe transition-colors leading-tight">
            Database Management Systems (DBMS)
          </h3>
          
          <p className="text-xs text-lms-taupe mt-1.5 line-clamp-2 leading-relaxed">
            Covers relational data models, ER diagrams, advanced SQL joins, relational algebra, 3NF/BCNF normalization, B+ tree indexing, and ACID concurrency control.
          </p>
        </div>

        {/* Progress & Meta Info */}
        <div className="space-y-3 pt-3 border-t border-lms-border/60">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
                alt="Dr. Christy Jeba Malar" 
                className="w-6 h-6 rounded-full border border-lms-sand"
              />
              <span className="font-bold text-lms-dark">Dr. Christy Jeba Malar</span>
            </div>
            <span className="font-bold text-lms-dark flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-lms-taupe" /> 5 Modules
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-bold text-lms-taupe mb-1">
              <span>Course Completion</span>
              <span className="text-lms-dark">60%</span>
            </div>
            <div className="w-full h-2 bg-lms-bg rounded-full overflow-hidden border border-lms-border/40">
              <div className="h-full bg-lms-sand rounded-full w-3/5 transition-all duration-500"></div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 3 Modules Completed
            </span>
            <span className="text-xs font-bold text-lms-dark group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Open Course <ArrowRight className="w-4 h-4 text-lms-sand" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
