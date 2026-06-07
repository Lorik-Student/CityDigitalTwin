import {
  Activity,
  Building2,
  CloudSun,
  Database,
  Gauge,
  Layers3,
  RadioTower,
  Route,
  ShieldCheck,
  TrafficCone,
} from 'lucide-react';

const telemetry = [
  { label: 'Cities', value: '09', detail: 'profiled municipalities' },
  { label: 'Sensors', value: '05', detail: 'Prizren traffic nodes' },
  { label: 'Refresh', value: '3s', detail: 'live stream interval' },
];

const signals = [
  { label: 'Weather', value: 'current conditions', icon: CloudSun },
  { label: 'Traffic', value: 'simulated sensor flow', icon: TrafficCone },
  { label: 'Access', value: 'token refresh secured', icon: ShieldCheck },
];

const layers = [
  {
    title: 'City Memory',
    description: 'PostgreSQL stores city profiles, user sessions, image URLs, and traffic sensor positions.',
    icon: Database,
  },
  {
    title: 'Realtime Pulse',
    description: 'The API streams changing congestion readings while weather and city data stay backend-driven.',
    icon: RadioTower,
  },
  {
    title: 'Map Surface',
    description: 'Mapbox layers turn static records and live readings into a spatial dashboard.',
    icon: Layers3,
  },
];

export function AboutPage() {
  return (
    <main className='fixed inset-0 z-10 overflow-y-auto bg-[#02090c] text-cyan-50'>
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.045)_1px,transparent_1px)] bg-[size:68px_68px] bg-[position:center_top]' />
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_42%_8%,rgba(6,182,212,0.24),transparent_34%),radial-gradient(circle_at_78%_34%,rgba(34,197,94,0.12),transparent_26%),linear-gradient(115deg,rgba(6,182,212,0.12),transparent_30%,rgba(34,197,94,0.08)_56%,transparent_78%),linear-gradient(180deg,rgba(2,9,12,0.04),#02090c_88%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 h-[136px] bg-[linear-gradient(rgba(6,182,212,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.075)_1px,transparent_1px),linear-gradient(to_bottom,rgba(7,17,22,0.5),rgba(7,17,22,0.16)_58%,transparent)] bg-[size:68px_68px,68px_68px,100%_100%] bg-[position:center_top] backdrop-blur-[1.5px]' />
      <div className='pointer-events-none absolute inset-x-0 top-[136px] h-px bg-gradient-to-r from-transparent via-cyan-400/18 to-transparent' />

      <section className='relative mx-auto flex min-h-screen w-[min(76rem,calc(100vw-2rem))] items-center pb-14 pt-32'>
        <div className='grid w-full items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
        <div className='flex h-full flex-col gap-5'>
          <div className='relative flex flex-1 flex-col justify-between overflow-hidden rounded-lg border border-cyan-500/24 bg-[#061014]/72 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl md:p-8'>
            <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent' />
            <div className='pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-cyan-400/60 via-transparent to-emerald-300/40' />

            <div className='mb-5 inline-flex w-fit items-center gap-2 rounded border border-cyan-500/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.12)] backdrop-blur-xl'>
              <Activity size={15} />
              Digital Twin Brief
            </div>

            <div className='mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-cyan-100/70'>
              <span className='h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.85)]' />
              System online
              <span className='h-px flex-1 bg-cyan-400/15' />
              Kosovo Map Layer
            </div>

            <h1 className='max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl'>
              A city map that behaves like a living control room.
            </h1>
            <p className='mt-5 max-w-2xl text-base leading-7 text-cyan-50/72'>
              CityDigitalTwin blends city records, authenticated API access, weather context, and simulated traffic streams into one calm interface for exploring urban data.
            </p>

            <div className='mt-8 grid gap-3 sm:grid-cols-3'>
              {telemetry.map((item) => (
                <div key={item.label} className='rounded border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl'>
                  <div className='text-xs font-semibold uppercase tracking-wide text-cyan-100/55'>{item.label}</div>
                  <div className='mt-2 text-3xl font-black text-white'>{item.value}</div>
                  <div className='mt-1 text-xs text-cyan-50/55'>{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className='grid gap-3 md:grid-cols-3'>
            {layers.map(({ title, description, icon: Icon }) => (
              <article key={title} className='rounded-lg border border-cyan-500/18 bg-[#071116]/68 p-4 shadow-[0_0_24px_rgba(6,182,212,0.08)] backdrop-blur-xl'>
                <div className='mb-3 flex items-center gap-3'>
                  <div className='grid h-9 w-9 shrink-0 place-items-center rounded border border-cyan-400/25 bg-cyan-400/10 text-cyan-200'>
                    <Icon size={18} />
                  </div>
                  <h2 className='font-bold text-white'>{title}</h2>
                </div>
                <p className='text-sm leading-6 text-cyan-50/64'>{description}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className='relative flex h-full flex-col justify-end'>
          <div className='flex flex-1 flex-col rounded-lg border border-cyan-500/24 bg-[#061014]/66 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl'>
            <div className='mb-5 flex items-center justify-between'>
              <div>
                <div className='text-xs font-semibold uppercase tracking-wide text-cyan-100/55'>Live Composition</div>
                <div className='mt-1 text-xl font-black text-white'>Data plane</div>
              </div>
              <Gauge className='text-cyan-200' size={24} />
            </div>

            <div className='space-y-3'>
              {signals.map(({ label, value, icon: Icon }) => (
                <div key={label} className='flex items-center gap-3 rounded border border-white/10 bg-white/[0.045] px-4 py-3'>
                  <div className='grid h-10 w-10 shrink-0 place-items-center rounded bg-cyan-400/10 text-cyan-200'>
                    <Icon size={19} />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='font-bold text-cyan-50'>{label}</div>
                    <div className='text-xs text-cyan-50/55'>{value}</div>
                  </div>
                  <span className='h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]' />
                </div>
              ))}
            </div>

            <div className='my-6 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent' />

            <div className='relative flex-1 rounded-lg border border-white/10 bg-[#02090c]/52 p-4'>
              <div className='mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-100/60'>
                <Route size={15} />
                Request path
              </div>
              <div className='space-y-4'>
                {['Frontend view', 'Express service', 'Database + sensor stream'].map((step, index) => (
                  <div key={step} className='flex items-center gap-3'>
                    <div className='grid h-8 w-8 shrink-0 place-items-center rounded border border-cyan-400/25 bg-cyan-400/10 text-sm font-black text-cyan-100'>
                      {index + 1}
                    </div>
                    <div className='h-px flex-1 bg-cyan-400/18' />
                    <div className='w-44 rounded border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-cyan-50/82'>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-4 grid grid-cols-2 gap-3'>
              <div className='rounded border border-white/10 bg-white/[0.04] p-3'>
                <Building2 className='mb-3 text-cyan-200' size={18} />
                <div className='text-xs font-semibold uppercase tracking-wide text-cyan-100/55'>Focus</div>
                <div className='mt-1 font-bold text-white'>Prizren demo zone</div>
              </div>
              <div className='rounded border border-white/10 bg-white/[0.04] p-3'>
                <RadioTower className='mb-3 text-cyan-200' size={18} />
                <div className='text-xs font-semibold uppercase tracking-wide text-cyan-100/55'>Mode</div>
                <div className='mt-1 font-bold text-white'>Realtime mock data</div>
              </div>
            </div>
          </div>
        </aside>
        </div>
      </section>
    </main>
  );
}
