import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, User, ArrowRight, Sparkles, CheckCircle2, Database, Cpu } from 'lucide-react';
import { Badge } from '../common/Badge';
import courselogo from '../../assets/courselogo.png';

export const FeaturedCourseCard = () => {
  const navigate = useNavigate();

  const courses = [
    {
      code: "23IT201",
      tag: "CS-501",
      title: "Database Management Systems (DBMS)",
      desc: "Covers relational data models, ER diagrams, SQL joins, relational algebra, 3NF/BCNF normalization, B+ tree indexing, and ACID concurrency control.",
      instructor: "Prof. Christy (SKCT)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      modulesCount: 10,
      icon: Database,
      path: "/course/dbms"
    },
    {
      code: "23IT202",
      tag: "CS-502",
      title: "Data Structures & Algorithms (DSA)",
      desc: "Master computational data structures, Big-O asymptotic analysis, dynamic arrays, linked lists, stacks, queues, binary search trees (BST), heaps, sorting, and graph algorithms.",
      instructor: "Prof. Christy (SKCT)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      modulesCount: 10,
      icon: Cpu,
      path: "/course/dsa"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {courses.map((course, idx) => {
        const IconComponent = course.icon;
        return (
          <div 
            key={idx}
            onClick={() => navigate(course.path)}
            className="bg-white border border-[#D0E3FF] rounded-2xl p-5 shadow-xs hover:shadow-lg hover:border-[#081F5C] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="sand">{course.tag}</Badge>
                  <span className="text-[10px] font-bold text-[#081F5C] bg-[#D0E3FF]/50 px-2 py-0.5 rounded-md">
                    {course.code}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Qwen 2.5 AI
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#081F5C] group-hover:text-blue-700 transition-colors leading-tight flex items-center gap-2">
                  <IconComponent className="w-5 h-5 text-[#081F5C] shrink-0" />
                  {course.title}
                </h3>
                
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {course.desc}
                </p>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="space-y-3 pt-4 mt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img 
                    src={course.avatar} 
                    alt={course.instructor} 
                    className="w-5 h-5 rounded-full border border-blue-200"
                  />
                  <span className="font-bold text-slate-700">{course.instructor}</span>
                </div>
                <span className="font-bold text-[#081F5C] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> {course.modulesCount} Modules
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active Spring Syllabus
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(course.path);
                  }}
                  className="bg-[#081F5C] hover:bg-blue-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 group-hover:translate-x-0.5"
                >
                  Explore Course <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
