import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Activity, Heart, Stethoscope, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import ArterySimulation from './components/ArterySimulation';
import AITutor from './components/AITutor';
import { Stage, StageInfo } from './types';

const STAGES_ORDER = [
  Stage.HEALTHY,
  Stage.ATHEROSCLEROSIS,
  Stage.RUPTURE_THROMBOSIS,
  Stage.NECROSIS,
  Stage.GUIDEWIRE,
  Stage.BALLOON,
  Stage.STENT_DEPLOY,
  Stage.RESTORED
];

const STAGE_CONTENT: Record<Stage, StageInfo> = {
  [Stage.HEALTHY]: {
    id: Stage.HEALTHY,
    title: "Здоровая коронарная артерия",
    description: "Коронарные артерии питают сердечную мышцу кислородом. В норме их стенки эластичны, а внутренний просвет (люмен) широк и чист, обеспечивая ламинарный (плавный) ток крови.",
    medicalContext: "Эндотелий (внутренняя выстилка) интактен, синтезирует оксид азота для вазодилатации. Кровоток достаточен для любых нагрузок."
  },
  [Stage.ATHEROSCLEROSIS]: {
    id: Stage.ATHEROSCLEROSIS,
    title: "Атеросклероз",
    description: "Со временем, из-за факторов риска (курение, холестерин, диабет), в стенке сосуда накапливаются липиды, формируя бляшку. Просвет сужается, но кровоток пока сохраняется.",
    medicalContext: "Формирование фиброзной покрышки над липидным ядром. Пациент может испытывать стенокардию напряжения (боль при нагрузке), но в покое симптомов нет."
  },
  [Stage.RUPTURE_THROMBOSIS]: {
    id: Stage.RUPTURE_THROMBOSIS,
    title: "Острый тромбоз (Инфаркт)",
    description: "Критический момент: бляшка разрывается. Организм пытается 'залечить' разрыв тромбоцитами, моментально образуя тромб, который полностью перекрывает просвет. Кровь перестает поступать.",
    medicalContext: "Острая ишемия. На ЭКГ регистрируется элевация сегмента ST (STEMI). Начинается обратный отсчет жизнеспособности ткани."
  },
  [Stage.NECROSIS]: {
    id: Stage.NECROSIS,
    title: "Некроз миокарда",
    description: "Без кислорода клетки сердца начинают умирать уже через 20-40 минут. Участок мышцы становится темным и безжизненным. Это необратимый процесс. Умершая ткань больше никогда не сможет сокращаться.",
    medicalContext: "Коагуляционный некроз. Выброс тропонинов в кровь. Риск фатальных аритмий и разрыва стенки желудочка. Принцип «Время — миокард»: чем быстрее открыть сосуд, тем меньше зона некроза."
  },
  [Stage.GUIDEWIRE]: {
    id: Stage.GUIDEWIRE,
    title: "ЧКВ: Проводник",
    description: "Пациент на операционном столе. Хирург через прокол в руке вводит катетер. Сквозь тромб аккуратно проводится тончайший металлический проводник (толщиной с волос).",
    medicalContext: "Проводник проходит сквозь мягкие тромботические массы и служит 'рельсом' для доставки баллонного катетера."
  },
  [Stage.BALLOON]: {
    id: Stage.BALLOON,
    title: "Баллонная Ангиопластика",
    description: "По проводнику доставляется сдутый баллон. В месте сужения хирург раздувает его под высоким давлением (до 20 атмосфер!). Бляшка вдавливается в стенки сосуда.",
    medicalContext: "Предилатация разрушает структуру бляшки и смещает тромботические массы, подготавливая ложе для имплантации стента."
  },
  [Stage.STENT_DEPLOY]: {
    id: Stage.STENT_DEPLOY,
    title: "Имплантация Стента",
    description: "Баллон сдувают и убирают. На его место доставляют стент — металлический сетчатый каркас. Он раскрывается, впиваясь в стенки артерии, чтобы держать её открытой вечно.",
    medicalContext: "Стент (Drug-Eluting Stent) выделяет цитостатики, предотвращая избыточный рост ткани (рестеноз). Металлическая конструкция служит постоянным каркасом."
  },
  [Stage.RESTORED]: {
    id: Stage.RESTORED,
    title: "Реперфузия (Восстановление)",
    description: "Кровоток восстановлен. Живые клетки спасены, но умершие замещаются рубцом. Главная цель достигнута — сердце продолжает биться, а риск смерти минимизирован.",
    medicalContext: "Оценка кровотока TIMI 3. Уменьшение болей и снижение сегмента ST. Начало постинфарктного ремоделирования сердца. Пожизненная терапия аспирином и статинами."
  }
};

const App: React.FC = () => {
  const [activeStage, setActiveStage] = useState<Stage>(Stage.HEALTHY);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Setup Intersection Observer to trigger animations on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stageId = entry.target.getAttribute('data-stage') as Stage;
            if (stageId) {
              setActiveStage(stageId);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Trigger when element is in the middle of screen
        threshold: 0.1,
      }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el instanceof Element) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const tutorContext = useMemo(() => {
    const content = STAGE_CONTENT[activeStage];
    return `Текущий этап обучения: ${content.title}. Описание: ${content.description}. Медицинский контекст: ${content.medicalContext}.`;
  }, [activeStage]);

  const scrollToStart = () => {
    sectionRefs.current[Stage.HEALTHY]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center p-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #14b8a6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="z-10 max-w-3xl space-y-6 animate-in fade-in zoom-in duration-1000">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/50 px-4 py-2 rounded-full text-teal-300 font-medium mb-4">
                <Activity size={16} />
                <span>Интерактивный гид</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-white">
                Инфаркт миокарда
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
                Поймите этиологию болезни и суть эндоваскулярной хирургии. 
                <br/>
                <span className="text-teal-400 font-medium">Листайте вниз</span>, чтобы увидеть, как мы спасаем сердце.
            </p>
            
            <button 
                onClick={scrollToStart}
                className="mt-12 animate-bounce bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors cursor-pointer"
            >
                <ChevronDown size={32} />
            </button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
            
          {/* Sticky Left Panel (Visualization) */}
          <div className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 p-4 md:p-8 flex flex-col justify-center z-20 bg-slate-50/90 backdrop-blur-sm lg:bg-transparent">
             <div className="w-full aspect-video lg:aspect-[4/3] relative">
                <ArterySimulation stage={activeStage} />
                
                {/* Floating Status Indicators */}
                <div className="absolute -bottom-12 left-0 w-full flex justify-between text-sm text-slate-500 font-medium px-4">
                    <div>Статус: <span className="text-slate-900">{STAGE_CONTENT[activeStage].title}</span></div>
                    <div className="flex items-center gap-2">
                        <Activity size={14} className={activeStage === Stage.NECROSIS ? 'text-red-500' : 'text-teal-500'} />
                        {activeStage === Stage.NECROSIS ? 'Кризис' : 'Мониторинг'}
                    </div>
                </div>
             </div>
          </div>

          {/* Scrollable Right Panel (Content) */}
          <div className="lg:w-1/2 p-6 md:p-12 pb-32 space-y-32">
            
            {STAGES_ORDER.map((stage, index) => {
                const content = STAGE_CONTENT[stage];
                const isActive = activeStage === stage;
                
                return (
                    <div 
                        key={stage}
                        id={stage}
                        data-stage={stage}
                        ref={el => { sectionRefs.current[stage] = el; }}
                        className={`transition-all duration-700 transform ${isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-10'}`}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg border-2 ${isActive ? 'bg-teal-600 text-white border-teal-600' : 'bg-transparent text-slate-400 border-slate-300'}`}>
                                {index + 1}
                            </span>
                            <span className="uppercase tracking-widest text-xs font-bold text-slate-400">
                                Этап
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                            {content.title}
                        </h2>

                        {stage === Stage.NECROSIS && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                                <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                                    <AlertTriangle size={20} />
                                    Время = Миокард
                                </div>
                                <p className="text-red-800 text-sm">
                                    Каждая минута промедления увеличивает зону необратимого некроза. Ткань отмирает и замещается рубцом.
                                </p>
                            </div>
                        )}

                        <div className="prose prose-lg prose-slate mb-8">
                            <p className="text-lg leading-relaxed text-slate-700">
                                {content.description}
                            </p>
                        </div>

                        <div className={`p-6 rounded-2xl border ${isActive ? 'bg-white border-teal-100 shadow-xl' : 'bg-slate-100 border-transparent'}`}>
                             <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">
                                <Stethoscope size={16} className="text-teal-600" />
                                Медицинский комментарий
                             </h3>
                             <p className="text-slate-600 font-mono text-sm leading-relaxed">
                                {content.medicalContext}
                             </p>
                        </div>

                        {stage === Stage.RESTORED && (
                            <div className="mt-12 p-8 bg-teal-600 rounded-3xl text-white text-center shadow-2xl shadow-teal-500/30">
                                <CheckCircle2 size={48} className="mx-auto mb-4 text-teal-200" />
                                <h3 className="text-2xl font-bold mb-2">Процедура завершена</h3>
                                <p className="opacity-90">Кровоток восстановлен, жизни пациента больше ничего не угрожает.</p>
                            </div>
                        )}
                    </div>
                );
            })}
            
          </div>
        </div>
      </main>

      <AITutor context={tutorContext} />
    </div>
  );
};

export default App;