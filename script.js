<script>
'use strict';

const APP = {
  data: {},
  session: null,
  permissions: {},
  token: '',
  charts: {},
  timers: {},
  state: {
    page: 'dashboard',
    newsCategoryTab: 'Tất cả',
    rulesCategoryTab: 'Tất cả',
    teams: [],
    dashboardTab: 'overview',
    taskTab: 'all',
    period: { key: 'this-month', label: 'Tháng này', from: null, to: null },
    search: {},
    filters: {},
    pageNo: {},
    pageSize: {},
    sort: {},
    view: { projects: 'cards', employees: 'cards', users: 'table', kpi: 'cards' },
    selected: {},
    calendarDate: new Date(),
    wizard: null,
    quickFlow: null,
    pendingFiles: [],
    uploadContext: null,
    import: null,
    profile: null,
    featureFilters: {},
    ganttExpanded: null,
    attendanceTimer: null,
    attendanceBusy: false,
    attendanceData: null,
    attendanceQrProcessed: false,
    attendanceTab: 'overview',
    attendanceEmployeeFilter: '',
    learningGradesData: null,
    learningGradesBusy: false,
    learningGradesSelectedEmployee: '',
    learningGradesSelectedSubject: '',
    learningGradesSelectedTerm: ''
  }
};

const PAGE_META = {
  dashboard:['Trung tâm điều hành','Quản lý công việc & KPI các Nhóm','dashboard'],
  'action-center':['Việc cần xử lý','Tập trung các công việc quá hạn, chờ xác nhận và KPI cần xử lý','task_alt'],
  news: ['Bảng tin', 'Thông báo và chia sẻ tài liệu Khát Vọng', 'campaign'],
  reflection: ['Phản tư', 'Chia sẻ suy nghĩ, bài học kinh nghiệm và hành trình trưởng thành', 'psychology'],
  rules: ['Nội quy', 'Quy định, nguyên tắc và hướng dẫn thực hiện dành cho thành viên', 'gavel'],
  teams: ['Đội/Nhóm', 'Quản lý đội, logo, người phụ trách và thành viên', 'diversity_3'],
  attendance: ['Điểm danh', 'Lịch điểm danh, tự điểm danh và tổng hợp chuyên cần nhân sự', 'how_to_reg'],
  'learning-grades': ['Điểm học tập', 'Quản lý đầu điểm, công thức tính và công bố kết quả theo từng tài khoản', 'school'],
  projects:['Dự án','Theo dõi dự án nội bộ, tiến độ và thành viên tham gia','folder_open'],
  tasks:['Công việc','Giao việc, theo dõi tiến độ và xác nhận kết quả','checklist'],
  calendar:['Lịch công việc','Theo dõi hạn hoàn thành công việc theo lịch','calendar_month'],
  'schedule-polls':['Bình chọn lịch','Tạo sự kiện và tìm khung giờ phù hợp cho cả nhóm','event_available'],
  kanban:['Kanban','Theo dõi công việc trực quan theo trạng thái','view_kanban'],
  gantt:['Gantt','Theo dõi tiến độ dự án và công việc theo thời gian','waterfall_chart'],
  reminders:['Nhắc việc','Theo dõi và gửi nhắc việc sắp đến hạn, quá hạn','notifications_active'],
  'kpi-month':['KPI tháng','Theo dõi kết quả KPI theo kỳ đang xem','speed'],
  'kpi-templates':['Mẫu KPI','Thiết lập bộ chỉ tiêu áp dụng cho từng Nhóm','description'],
  'kpi-evaluation':['Đánh giá KPI','Quản lý đánh giá các chỉ tiêu cần chấm thủ công','fact_check'],
  'kpi-finalize':['Chốt KPI','Kiểm tra và khóa kết quả KPI cuối kỳ','lock'],
  employees:['Nhân sự','Hồ sơ nhân sự phục vụ giao việc, dự án và KPI','groups'],
  categories:['Danh mục','Quản lý dữ liệu nền linh hoạt của hệ thống','tune'],
  files:['Tài liệu','Tập trung toàn bộ tài liệu liên kết với hồ sơ nghiệp vụ','folder_copy'],
  reports:['Báo cáo & Cuộc họp','Nộp báo cáo công việc, quản lý báo cáo và ghi chép biên bản cuộc họp','assignment'],
  audit:['Nhật ký hoạt động','Theo dõi các thao tác quan trọng trong hệ thống','history'],
  users:['Người dùng','Quản lý tài khoản, vai trò và phạm vi dữ liệu','manage_accounts'],
  help:['Hướng dẫn sử dụng','Các bước thiết lập và vận hành web app','menu_book']
};

const STATUS_COLORS = {
  'Hoàn thành':'green','Đã chốt':'green','Đã đánh giá':'blue','Đang thực hiện':'blue','Đang theo dõi':'blue','Đang áp dụng':'green','Hoạt động':'green','Đang tham gia':'green',
  'Chờ xác nhận':'orange','Chờ quản lý duyệt':'orange','Chờ tự đánh giá':'orange','Tự động':'blue','Không áp dụng':'gray','Đã duyệt':'green','Chưa bắt đầu':'gray','Tạm dừng':'gray','Tạm khóa':'gray','Đã kết thúc':'gray',
  'Đã hủy':'red','Đã xóa':'red','Khẩn':'red','Cao':'orange','Bình thường':'blue','Thấp':'gray',
  'Vượt mục tiêu':'green','Tốt':'blue','Đạt':'violet','Cần cải thiện':'orange','Chưa đạt':'red'
};

const FIELD_TOOLTIPS = {
  employees:{
    'Họ và tên':'Nhập họ tên đầy đủ của nhân sự. Tên này được hiển thị ở giao việc, dự án, KPI và báo cáo.',
    'Nhóm':'Chọn Nhóm từ Danh mục. Dữ liệu dùng để phân nhóm nhân sự, lọc và báo cáo KPI.',
    'Chức vụ':'Chọn chức vụ hiện tại của nhân sự. Dữ liệu dùng để nhận biết vai trò trong tổ chức.',
    'Mã quản lý trực tiếp':'Chọn quản lý trực tiếp. Hệ thống dùng thông tin này để xác định đội nhóm và quyền đánh giá KPI.',
    'Email':'Nhập email đúng định dạng. Đây là thông tin liên hệ của nhân sự.',
    'Số điện thoại':'Nhập số điện thoại bắt đầu bằng 0. Hệ thống giữ nguyên số 0 đầu.',
    'Ngày tháng năm sinh':'Chọn ngày nhân sự bắt đầu làm việc theo định dạng ngày/tháng/năm.',
    'Trạng thái':'Chọn đúng trạng thái làm việc. Nhân sự ngừng hoạt động không nên tiếp tục được giao việc mới.',
    'Ghi chú':'Nhập thông tin bổ sung cần lưu trong hồ sơ nhân sự.'
  },
  projects:{
    'Tên dự án':'Nhập tên dự án nội bộ rõ ràng, dễ nhận biết trong bảng công việc và báo cáo.',
    'Loại dự án':'Chọn loại dự án từ Danh mục để phục vụ lọc và báo cáo.',
    'Mã người phụ trách':'Chọn một người chịu trách nhiệm chính cho dự án. Dự án vẫn có thể có nhiều thành viên tham gia.',
    'Ngày bắt đầu':'Ngày bắt đầu kế hoạch của dự án.',
    'Ngày dự kiến kết thúc':'Hạn hoàn thành dự kiến. Ngày này dùng để theo dõi dự án cần chú ý.',
    'Trạng thái':'Trạng thái lõi của dự án được cố định để không làm sai Dashboard và báo cáo.',
    'Mức độ ưu tiên':'Dùng để cảnh báo và ưu tiên xử lý dự án.',
    'Tiến độ (%)':'Hệ thống tự cập nhật từ tiến độ các công việc thuộc dự án.',
    'Mô tả':'Mô tả phạm vi, mục tiêu hoặc kết quả mong đợi của dự án.',
    'Ghi chú':'Thông tin bổ sung không ảnh hưởng tính toán.'
  },
  tasks:{
    'Tên công việc':'Nhập nội dung công việc cụ thể, có thể kiểm tra được kết quả.',
    'Mã dự án':'Chọn dự án mà công việc thuộc về. Dữ liệu dùng để tổng hợp tiến độ dự án.',
    'Nhóm công việc':'Chọn nhóm công việc từ Danh mục để lọc và phân tích khối lượng.',
    'Mã người phụ trách':'Chọn đúng một người chịu trách nhiệm chính. KPI công việc mặc định ghi nhận cho người này.',
    'Mã người giao việc':'Hệ thống ghi nhận người giao công việc để truy vết trách nhiệm.',
    'Ngày bắt đầu':'Ngày bắt đầu thực hiện công việc.',
    'Hạn hoàn thành':'Hạn xử lý công việc. Dữ liệu dùng để xác định sắp đến hạn, quá hạn và KPI đúng hạn.',
    'Mức độ ưu tiên':'Chọn Thấp, Bình thường, Cao hoặc Khẩn để ưu tiên xử lý.',
    'Trạng thái':'Nhóm làm xong chuyển Chờ xác nhận. Quản lý mới xác nhận thành Hoàn thành.',
    'Tiến độ (%)':'Cập nhật từ 0 đến 100. Khi Chờ xác nhận hoặc Hoàn thành hệ thống đưa về 100%.',
    'Trọng số công việc':'Hệ số khối lượng của công việc, mặc định 1. Việc phức tạp hơn có thể đặt 2, 3... tối đa 10 để KPI theo trọng số phản ánh đúng khối lượng.',
    'Kết quả':'Ghi kết quả đầu ra đã thực hiện, đặc biệt trước khi gửi Chờ xác nhận.',
    'Mô tả':'Mô tả yêu cầu, phạm vi và lưu ý cần thực hiện.',
    'Ghi chú':'Thông tin bổ sung chung của công việc.',
    'Nhận xét quản lý':'Phản hồi riêng của quản lý khi xác nhận, trả lại hoặc mở lại công việc.',
    'Hành động quản lý':'Hệ thống tự ghi hành động quản lý gần nhất: xác nhận hoàn thành, trả lại thực hiện hoặc mở lại công việc.',
    'Ngày phản hồi quản lý':'Hệ thống tự ghi thời điểm quản lý thực hiện hành động xác nhận, trả lại hoặc mở lại.'
  },
  users:{
    'Tên đăng nhập':'Tên dùng tại màn hình đăng nhập. Không được trùng với tài khoản khác.',
    'Mật khẩu':'Mật khẩu đăng nhập. Khi sửa tài khoản có thể để trống để giữ mật khẩu hiện tại.',
    'Vai trò':'Vai trò cố định quyết định chức năng được phép sử dụng.',
    'Mã nhân sự':'Liên kết tài khoản với hồ sơ nhân sự để xác định dữ liệu cá nhân và đội nhóm.',
    'Phạm vi dữ liệu':'Quản trị xem toàn công ty, Quản lý xem đội nhóm, Nhóm xem dữ liệu liên quan cá nhân.',
    'Trạng thái':'Tài khoản Tạm khóa sẽ không thể đăng nhập.'
  },
  kpiTemplates:{
    'Tên mẫu KPI':'Đặt tên bộ KPI theo Nhóm hoặc nhóm áp dụng.',
    'Phạm vi áp dụng':'Xác định mẫu áp dụng theo Nhóm, chức vụ hoặc nhân sự cụ thể.',
    'Giá trị áp dụng':'Nhập/chọn đúng giá trị tương ứng với phạm vi áp dụng.',
    'Trạng thái':'Mẫu Ngừng áp dụng không nên dùng để tạo KPI kỳ mới.',
    'Ngày hiệu lực':'Ngày bộ KPI bắt đầu có hiệu lực.'
  }
};

const IMPORT_CONFIG = {
  employees:{label:'Nhân sự',fields:['Họ và tên','Nhóm','Chức vụ','Mã quản lý trực tiếp','Email','Số điện thoại','Ngày tháng năm sinh','Trạng thái','Ghi chú'],required:['Họ và tên','Nhóm','Chức vụ','Trạng thái'],dateFields:['Ngày tháng năm sinh'],optionMap:{'Nhóm':'category:Nhóm','Chức vụ':'category:Chức vụ','Mã quản lý trực tiếp':'employees','Trạng thái':['Đang làm','Tạm nghỉ','Đã nghỉ']}},
  projects:{label:'Dự án',fields:['Tên dự án','Loại dự án','Mã người phụ trách','Ngày bắt đầu','Ngày dự kiến kết thúc','Trạng thái','Mức độ ưu tiên','Mô tả','Ghi chú'],required:['Tên dự án','Loại dự án','Mã người phụ trách','Ngày bắt đầu','Ngày dự kiến kết thúc','Trạng thái','Mức độ ưu tiên'],dateFields:['Ngày bắt đầu','Ngày dự kiến kết thúc'],optionMap:{'Loại dự án':'category:Loại dự án','Mã người phụ trách':'employees','Trạng thái':'fixed:projectStatus','Mức độ ưu tiên':'fixed:priority'}},
  tasks:{label:'Công việc',fields:['Tên công việc','Mã dự án','Nhóm công việc','Mã người phụ trách','Ngày bắt đầu','Hạn hoàn thành','Mức độ ưu tiên','Trạng thái','Tiến độ (%)','Trọng số công việc','Kết quả','Mô tả','Ghi chú'],required:['Tên công việc','Mã dự án','Nhóm công việc','Mã người phụ trách','Ngày bắt đầu','Hạn hoàn thành','Mức độ ưu tiên','Trạng thái'],dateFields:['Ngày bắt đầu','Hạn hoàn thành'],numberFields:['Tiến độ (%)','Trọng số công việc'],optionMap:{'Mã dự án':'projects','Nhóm công việc':'category:Nhóm công việc','Mã người phụ trách':'employees','Mức độ ưu tiên':'fixed:priority','Trạng thái':'fixed:taskStatus'}},
  kpiTemplates:{label:'Mẫu KPI',fields:['Tên mẫu KPI','Phạm vi áp dụng','Giá trị áp dụng','Mô tả','Trạng thái','Ngày hiệu lực'],required:['Tên mẫu KPI','Phạm vi áp dụng','Giá trị áp dụng','Trạng thái'],dateFields:['Ngày hiệu lực'],optionMap:{'Trạng thái':'fixed:templateStatus'}}
};

/* ========================= STARTUP ========================= */
document.addEventListener('DOMContentLoaded', () => initializeApp());

async function initializeApp(){
  try{
    setLoadingState('Đang kiểm tra phiên đăng nhập','Vui lòng chờ trong giây lát.',false);
    bindGlobalEvents();
    initTheme();
    initPeriod('this-month');
    APP.token = localStorage.getItem('sme_app_token') || '';
    if(!APP.token){ showLogin(); return; }
    try{
      const res = await gas('getSessionInfo', APP.token, {timeout:30000});
      APP.session = res.session;
    }catch(err){
      console.warn('Session restore failed', err);
      if(isSessionAuthError(err)){
        clearLocalSession();
        showLogin('');
        return;
      }
      showStartupError(err);
      return;
    }
    try{
      await loadBootstrap();
    }catch(err){
      console.error('Bootstrap failed', err);
      // Lỗi dữ liệu/mạng không được xóa phiên đăng nhập bền vững.
      showStartupError(err);
    }
  }catch(err){
    console.error(err); showStartupError(err);
  }
}

function bindGlobalEvents(){
  document.addEventListener('click', handleClick, true);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('change', handleChange, true);
  document.addEventListener('keydown', handleKeydown, true);
  document.addEventListener('mouseover', handleTooltipHover, true);
  document.addEventListener('mouseout', handleTooltipOut, true);
  window.addEventListener('resize', ()=>{ hideTooltipPortal(); closeComboMenu(); });
  window.addEventListener('scroll', handleFloatingScroll, true);
  const loginForm=document.getElementById('login-form');
  if(loginForm) loginForm.addEventListener('submit', handleLogin);
}

async function handleLogin(e){
  e.preventDefault();
  const username=document.getElementById('login-username').value.trim();
  const password=document.getElementById('login-password').value;
  const btn=document.getElementById('login-submit');
  setButtonBusy(btn,true,'Đang đăng nhập');
  hideEl('login-error');

  let res;
  try{
    res=await gas('checkLogin',username,password,{timeout:45000});
  }catch(err){
    const el=document.getElementById('login-error');
    if(el){el.textContent=err.message;el.classList.remove('hidden');}
    setButtonBusy(btn,false);
    return;
  }

  APP.token=res.token;
  APP.session=res.session;
  localStorage.setItem('sme_app_token',APP.token);
  hideEl('login-view');
  showEl('loading-screen');
  setLoadingState('Đang tải dữ liệu','Đang chuẩn bị dữ liệu theo quyền truy cập.',false);

  try{
    await loadBootstrap();
  }catch(err){
    console.error('Bootstrap after login failed',err);
    if(isSessionAuthError(err)){
      clearLocalSession();
      showLogin('Không thể khôi phục phiên đăng nhập. Vui lòng đăng nhập lại.');
    }else{
      showStartupError(err);
    }
  }finally{
    setButtonBusy(btn,false);
  }
}

async function loadBootstrap(){
  setLoadingState('Đang tải dữ liệu','Đang đồng bộ công việc, dự án và KPI.',false);
  try{
    const data=await gas('getBootstrapData',APP.token,{timeout:90000});
    APP.data=data; APP.session=data.session; APP.permissions=data.permissions||{};
    APP.state.teams=Array.isArray(data.teams)?data.teams:[];
    setUserShell(); applyPermissions();
    hideEl('login-view'); hideEl('loading-screen'); showEl('app-container');
    changePage(APP.state.page || 'dashboard', true);
    applyLaunchLocation();
    await processAttendanceQrLink();
  }catch(err){
    if(isSessionAuthError(err)){
      clearLocalSession();
      showLogin('Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.');
      return;
    }
    throw err;
  }
}

function isSessionAuthError(err){
  const msg=String(err?.message||err||'');
  return /Phiên đăng nhập|không còn hoạt động|Tài khoản đang bị khóa/i.test(msg);
}

function clearLocalSession(){
  localStorage.removeItem('sme_app_token');
  APP.token='';
  APP.session=null;
  APP.permissions={};
}

function showLogin(message=''){
  hideEl('loading-screen'); hideEl('app-container'); showEl('login-view');
  const err=document.getElementById('login-error'); if(err){err.textContent=message;err.classList.toggle('hidden',!message);}
  setTimeout(()=>document.getElementById('login-username')?.focus(),50);
}
function showStartupError(err){
  showEl('loading-screen');
  setLoadingState('Không thể tải dữ liệu',err.message || 'Đã xảy ra lỗi khi khởi tạo hệ thống.',true);
}
function setLoadingState(status,description,retry){
  const s=document.getElementById('loading-status'),d=document.getElementById('loading-description'),r=document.getElementById('loading-retry');
  if(s)s.textContent=status;if(d)d.textContent=description;if(r)r.classList.toggle('hidden',!retry);
}
function showEl(id){document.getElementById(id)?.classList.remove('hidden')}function hideEl(id){document.getElementById(id)?.classList.add('hidden')}

function gas(functionName,...args){
  let options={};
  if(args.length && args[args.length-1] && args[args.length-1].timeout && Object.keys(args[args.length-1]).length<=2) options=args.pop();
  const timeout=options.timeout || (functionName.includes('Uploaded')?120000:60000);
  return new Promise((resolve,reject)=>{
    if(!functionName || typeof functionName!=='string') return reject(new Error('Tên thao tác hệ thống không hợp lệ.'));
    let settled=false;
    const timer=setTimeout(()=>{if(!settled){settled=true;reject(new Error('Yêu cầu xử lý quá thời gian cho phép. Vui lòng thử lại.'));}},timeout);
    try{
      const runner=google.script.run
        .withSuccessHandler(result=>{if(settled)return;settled=true;clearTimeout(timer);resolve(result);})
        .withFailureHandler(error=>{if(settled)return;settled=true;clearTimeout(timer);reject(normalizeGasError(error));});
      if(typeof runner[functionName]!=='function'){clearTimeout(timer);return reject(new Error('Chức năng '+functionName+' chưa tồn tại trên hệ thống.'));}
      runner[functionName](...args);
    }catch(err){clearTimeout(timer);reject(err);}
  });
}
function normalizeGasError(err){return new Error((err&&err.message)||String(err||'Không thể xử lý yêu cầu.'));}

function setUserShell(){
  const s=APP.session||{};
  const displayName=s.employeeName||s.username||'Người dùng';
  setText('top-user-name',displayName); setText('top-user-role',[s.position,s.role].filter(Boolean).join(' / '));
  const av=document.getElementById('top-avatar');
  if(av){
    const employee=(APP.data.employees||[]).find(e=>String(e['Mã nhân sự']||'')===String(s.employeeId||''))||null;
    const raw=String(employee?.['Ảnh đại diện URL']||'').trim();
    const direct=(typeof employeeDirectAvatarSrc==='function')?employeeDirectAvatarSrc(employee):(/^https?:\/\//i.test(raw)||/^data:image\//i.test(raw)?raw:'');
    av.className='avatar avatar-photo';
    av.removeAttribute('data-avatar-file-id');
    av.removeAttribute('data-avatar-employee-id');
    av.removeAttribute('data-avatar-bound');
    av.removeAttribute('data-avatar-queued');
    av.removeAttribute('data-avatar-loaded');
    av.title=displayName;
    if(direct){
      av.innerHTML=`<img src="${escapeAttr(direct)}" alt="${escapeAttr(displayName)}">`;
    }else{
      av.textContent=initials(displayName);
      const m=raw.match(/^drive-file:(.+)$/i);
      if(m&&m[1]){
        av.classList.add('avatar-lazy');
        av.dataset.avatarFileId=m[1];
        av.dataset.avatarEmployeeId=s.employeeId||'';
        const cached=APP.state.avatarCache?.[m[1]];
        if(cached && typeof applyLazyAvatarData==='function') applyLazyAvatarData(av,cached);
        else requestAnimationFrame(()=>{ if(typeof initLazyEmployeeAvatars==='function') initLazyEmployeeAvatars(document.querySelector('.topbar')||document); });
      }
    }
  }
  updatePeriodLabel();
}
function roleAllowedPages(){
  const configured=Array.isArray(APP.permissions?.allowedPages)?APP.permissions.allowedPages:[];
  if(configured.length){const allowed=new Set(configured);if(['Quản trị','Quản lý','Học sinh','Nhóm'].includes(APP.session?.role)){allowed.add('reflection');allowed.add('rules');allowed.add('teams');allowed.add('attendance');allowed.add('learning-grades');}return allowed;}
  const role=APP.session?.role||'Nhóm';
  if(role==='Quản trị')return new Set(Object.keys(PAGE_META));
  if(role==='Quản lý')return new Set(['dashboard','action-center','news','reflection','rules','projects','tasks','kanban','gantt','calendar','schedule-polls','reminders','kpi-month','kpi-evaluation','kpi-finalize','employees','teams','attendance','learning-grades','files','reports','audit','help']);

return new Set([
  'dashboard',
  'action-center',
  'projects',
  'tasks',
  'news',
  'reflection',
  'rules',
  'teams',
  'attendance',
  'learning-grades',
  'kanban',
  'gantt',
  'calendar',
  'schedule-polls',
  'reminders',
  'kpi-month',
  'files',
  'reports',
  'help'
]);
  return new Set(['dashboard','action-center','projects','tasks','news','reflection','rules','kanban','gantt','calendar','schedule-polls','reminders','kpi-month','files','help']);
}
function canAccessPageByRole(page){return roleAllowedPages().has(page);}
function ensureTeamsNav(){
  const rulesNav=document.querySelector('.nav-item[data-page="rules"]');
  const group=rulesNav?.closest('.nav-group');
  if(!rulesNav||!group)return;
  let item=document.querySelector('.nav-item[data-page="teams"]');
  if(!item){
    item=document.createElement('button');
    item.type='button';item.className='nav-item';item.dataset.page='teams';
    item.innerHTML='<span class="material-symbols-rounded">diversity_3</span><span>Đội/Nhóm</span>';
  }
  // Dù menu đã có sẵn trong HTML, luôn đặt Đội/Nhóm ngay sau Nội quy.
  if(rulesNav.nextElementSibling!==item)rulesNav.insertAdjacentElement('afterend',item);
}
function ensureAttendanceNav(){
  const teamsNav=document.querySelector('.nav-item[data-page="teams"]');
  const group=teamsNav?.closest('.nav-group');
  if(!teamsNav||!group)return;
  let item=document.querySelector('.nav-item[data-page="attendance"]');
  if(!item){
    item=document.createElement('button'); item.type='button'; item.className='nav-item'; item.dataset.page='attendance';
    item.innerHTML='<span class="material-symbols-rounded">how_to_reg</span><span>Điểm danh</span>';
  }
  if(teamsNav.nextElementSibling!==item)teamsNav.insertAdjacentElement('afterend',item);
}
function ensureLearningGradesNav(){
  const attendanceNav=document.querySelector('.nav-item[data-page="attendance"]');
  const group=attendanceNav?.closest('.nav-group');
  if(!attendanceNav||!group)return;
  let item=document.querySelector('.nav-item[data-page="learning-grades"]');
  if(!item){item=document.createElement('button');item.type='button';item.className='nav-item';item.dataset.page='learning-grades';item.innerHTML='<span class="material-symbols-rounded">school</span><span>Điểm học tập</span>'; }
  if(attendanceNav.nextElementSibling!==item)attendanceNav.insertAdjacentElement('afterend',item);
}
function ensureSchedulePollNav(){
  if(document.querySelector('.nav-item[data-page="schedule-polls"]')) return;
  const calendarNav=document.querySelector('.nav-item[data-page="calendar"]');
  const group=calendarNav?.closest('.nav-group');
  if(!group) return;
  const item=document.createElement('button');
  item.type='button'; item.className='nav-item'; item.dataset.page='schedule-polls';
  item.innerHTML='<span class="material-symbols-rounded">event_available</span><span>Bình chọn lịch</span>';
  calendarNav.insertAdjacentElement('afterend',item);
}
function applyRoleMenuVisibility(){
  ensureSchedulePollNav();
  ensureTeamsNav();
  ensureAttendanceNav();
  ensureLearningGradesNav();
  const allowed=roleAllowedPages();
  document.querySelectorAll('.nav-item[data-page]').forEach(el=>el.classList.toggle('hidden',!allowed.has(el.dataset.page)));
  document.querySelectorAll('.nav-group').forEach(group=>{
    const hasVisible=[...group.querySelectorAll('.nav-item[data-page]')].some(el=>!el.classList.contains('hidden'));
    group.classList.toggle('hidden',!hasVisible);
  });
}
function applyPermissions(){
  document.querySelectorAll('.admin-only').forEach(el=>el.classList.toggle('hidden',!APP.permissions.isAdmin));
  document.querySelectorAll('.manager-only').forEach(el=>el.classList.toggle('hidden',!(APP.permissions.isAdmin||APP.permissions.isManager)));
  applyRoleMenuVisibility();
  syncTopQuickFlowButton();
  syncDashboardPdfButton();
}
function syncTopQuickFlowButton(page=APP.state.page){
  const btn=document.getElementById('top-quick-flow');
  if(!btn)return;
  // Nút Thêm nhanh là thao tác toàn cục ở Header: giữ hiển thị ở mọi module
  // khi tài khoản có đủ quyền tạo dự án và giao công việc.
  const visible=Boolean(APP.permissions.canManageProjects && APP.permissions.canCreateTask);
  btn.classList.toggle('hidden',!visible);
}
function setText(id,text){const el=document.getElementById(id);if(el)el.textContent=text;}


/* ========================= EMAIL / DEEP LINK ========================= */
function applyLaunchLocation(){
  try{
    if(typeof google==='undefined' || !google.script || !google.script.url || !google.script.url.getLocation) return;
    google.script.url.getLocation(locationInfo=>{
      const params=locationInfo?.parameter||{};
      const requestedPage=String(params.page||'').trim();
      const pollId=String(params.poll||'').trim();
      const taskId=String(params.task||params.taskId||'').trim();
      if(pollId){
        APP.state.schedulePollId=pollId;
        changePage('schedule-polls',true);
        return;
      }
      if(taskId){
        const exists=(APP.data.tasks||[]).some(t=>String(t['Mã công việc']||'')===taskId);
        changePage('tasks',true);
        if(exists){
          setTimeout(()=>openTaskProfile(taskId),80);
        }else{
          showToast('Không tìm thấy công việc',`Công việc ${taskId} không nằm trong phạm vi dữ liệu của tài khoản này.`,'warning',5000);
        }
        return;
      }
      if(requestedPage && PAGE_META[requestedPage]) changePage(requestedPage,true);
    });
  }catch(err){
    console.warn('Không thể xử lý deep-link',err);
  }
}


(function(){
  if(document.getElementById('bulk-task-reminder-styles'))return;
  const style=document.createElement('style');
  style.id='bulk-task-reminder-styles';
  style.textContent=`
    .btn-remind-all{background:#fff7ed!important;border:1px solid #fed7aa!important;color:#c2410c!important;font-weight:700}
    .btn-remind-all:hover{background:#ffedd5!important;border-color:#fdba74!important}
    .bulk-reminder-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
    .bulk-reminder-stat{border:1px solid #e1e7f0;background:#f8faff;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:4px}
    .bulk-reminder-stat strong{font-size:25px;line-height:1.1;color:#263b65}
    .bulk-reminder-stat span{font-size:11px;color:#667792}
    .bulk-reminder-notes{padding-left:19px;margin:8px 0;color:#475467;font-size:12px;line-height:1.65}
    .bulk-reminder-warning{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;color:#9a3412;font-size:11px;line-height:1.5}
    .bulk-reminder-warning .material-symbols-rounded{font-size:18px;flex:0 0 auto}
    @media(max-width:600px){.bulk-reminder-summary{grid-template-columns:1fr 1fr}.btn-remind-all{white-space:nowrap}}
  `;
  document.head.appendChild(style);
})();

/* ========================= EVENT ROUTER ========================= */
async function handleClick(e){
  const nav=e.target.closest('[data-page]');
  if(nav){ e.preventDefault(); changePage(nav.dataset.page); return; }
  const action=e.target.closest('[data-action]');
  if(action){
    if(action.dataset.action==='schedule-poll-toggle-slot'&&Number(APP.state.schedulePollSuppressClickUntil||0)>Date.now()){
      APP.state.schedulePollSuppressClickUntil=0;e.preventDefault();return;
    }
    e.preventDefault(); await routeAction(action.dataset.action,action,e); return;
  }
  const combo=e.target.closest('.combo');
  if(combo && !e.target.closest('.combo-option')) openCombo(combo);
  if(!e.target.closest('#user-dropdown')&&!e.target.closest('#user-menu-trigger')) hideEl('user-dropdown');
  if(!e.target.closest('#period-menu')&&!e.target.closest('#period-trigger')) hideEl('period-menu');
  if(!e.target.closest('#notification-popover')&&!e.target.closest('[data-action="toggle-notifications"]')) hideEl('notification-popover');
}

async function routeAction(action,el,e){
  const map={
    'news-new':()=>openNewsPostModal(), 'news-refresh':()=>loadNewsFeed(), 'news-category-tab':()=>{APP.state.newsCategoryTab=el.dataset.category||'Tất cả';renderNewsFeed(APP.state.newsFeed||[]);}, 'news-save':()=>saveNewsPost(), 'news-hide':()=>hideNewsPostFromFeed(el.dataset.id), 'news-delete':()=>deleteNewsPostFromFeed(el.dataset.id), 'news-mark-read':()=>markNewsRead(el.dataset.id), 'news-ask-question':()=>openNewsQuestionModal(el.dataset.id), 'news-question-save':()=>saveNewsQuestion(el.dataset.id), 'news-monitor':()=>monitorNewsPost(el.dataset.id), 'reflection-new':()=>openReflectionComposer(el.dataset.column||'Mục 1'), 'reflection-edit':()=>openReflectionComposer(el.dataset.column||'Mục 1',el.dataset.id), 'reflection-save':()=>saveReflectionPost(), 'reflection-refresh':()=>loadReflectionFeed(), 'reflection-delete':()=>deleteReflectionPost(el.dataset.id), 'rules-new':()=>openRulesPostModal(), 'rules-refresh':()=>loadRulesFeed(), 'rules-category-tab':()=>{APP.state.rulesCategoryTab=el.dataset.category||'Tất cả';renderRulesFeed(APP.state.rulesFeed||[]);}, 'rules-save':()=>saveRulesPost(), 'rules-hide':()=>hideRulesPostFromFeed(el.dataset.id), 'rules-delete':()=>deleteRulesPostFromFeed(el.dataset.id), 'rules-mark-read':()=>markRulesRead(el.dataset.id), 'rules-ask-question':()=>openRulesQuestionModal(el.dataset.id), 'rules-question-save':()=>saveRulesQuestion(el.dataset.id), 'rules-monitor':()=>monitorRulesPost(el.dataset.id), 'teams-refresh':()=>loadTeams(), 'team-new':()=>openTeamModal(), 'team-edit':()=>openTeamModal(el.dataset.id), 'team-save':()=>saveTeam(), 'team-delete':()=>deleteTeamFromSystem(el.dataset.id), 'attendance-refresh':()=>loadAttendanceData(), 'attendance-tab':()=>{APP.state.attendanceTab=el.dataset.tab||'overview';renderAttendanceContent(APP.state.attendanceData||{});}, 'attendance-setup-automation':()=>setupAttendanceAutomationUi(), 'attendance-create':()=>createAttendanceFromForm(), 'attendance-checkin':()=>submitAttendance(el.dataset.id), 'attendance-qr':()=>showAttendanceQr(el.dataset.id), 'attendance-camera':()=>openAttendanceCamera(), 'attendance-status-save':()=>saveAttendanceStatus(el.dataset.session,el.dataset.employee), 'attendance-edit':()=>openAttendanceEditModal(el.dataset.id), 'attendance-edit-save':()=>saveAttendanceSessionFromForm(el.dataset.id), 'attendance-delete':()=>deleteAttendanceSessionFromUi(el.dataset.id),
    'learning-grades-refresh':()=>loadLearningGrades(), 'learning-grade-component-save':()=>saveLearningGradeComponentUi(), 'learning-grade-formula-save':()=>saveLearningGradeFormulaUi(), 'learning-grade-score-save':()=>saveLearningGradeScoreUi(), 'learning-grade-publish':()=>publishLearningGradesUi(), 'learning-grade-student-select':()=>{APP.state.learningGradesSelectedEmployee=el.value;renderLearningGradesContent(APP.state.learningGradesData||{});}, 'learning-grade-subject-select':()=>{APP.state.learningGradesSelectedSubject=el.value;renderLearningGradesContent(APP.state.learningGradesData||{});}, 'learning-grade-term-select':()=>{APP.state.learningGradesSelectedTerm=el.value;renderLearningGradesContent(APP.state.learningGradesData||{});},
    'refresh-data':async()=>refreshAll(), 'toggle-theme':()=>toggleTheme(), 'logout':()=>doLogout(), 'toggle-notifications':()=>toggleNotifications(el),
    'new-task':()=>openTaskWizard(), 'new-project':()=>openProjectModal(), 'new-employee':()=>openEmployeeModal(),
    'new-kpi':()=>openCreateKpiModal(), 'custom-period':()=>openCustomPeriodModal(), 'go-profile':()=>openMyProfile(),
    'close-modal':()=>closeModal(), 'close-preview':()=>closePreview(), 'toggle-sidebar':()=>toggleSidebarMobile(),
    'new-category':()=>openCategoryModal(el.dataset.group), 'new-user':()=>openUserModal(), 'new-template':()=>openKpiTemplateModal(),
    'upload-file':()=>openUploadModal(), 'upload-task-file':()=>openTaskUploadModal(el.dataset.id), 'open-import':()=>openImportModal(el.dataset.module), 'download-template':()=>downloadXlsxTemplate(el.dataset.module),
    'export-xlsx':()=>exportCurrentXlsx(el.dataset.module), 'export-a4-dashboard-report':()=>exportA4DashboardReportPdf(), 'clear-filters':()=>clearModuleFilters(el.dataset.module),
    'calendar-prev':()=>changeCalendarMonth(-1),'calendar-next':()=>changeCalendarMonth(1),'calendar-today':()=>goCalendarToday(),
    'schedule-poll-create':()=>createSchedulePollFromForm(),
    'schedule-poll-select-all':()=>setSchedulePollInviteSelection(true),
    'schedule-poll-clear-all':()=>setSchedulePollInviteSelection(false),
    'schedule-poll-select-all-checkbox':()=>setSchedulePollInviteSelection(!!el.checked),
    'schedule-poll-open':()=>openSchedulePoll(el.dataset.id),
    'schedule-poll-delete':()=>deleteSchedulePollFromList(el.dataset.id,el.dataset.title||''),
    'schedule-poll-back':()=>{APP.state.schedulePollId='';renderSchedulePolls();},
    'schedule-poll-toggle-slot':()=>toggleScheduleSlot(el.dataset.slot),
    'schedule-poll-save-vote':()=>saveScheduleVoteFromPage(),
    'schedule-poll-copy-link':()=>copySchedulePollLink(el.dataset.id),
    'schedule-poll-refresh':()=>renderSchedulePolls(),
    'wizard-add-one':()=>wizardAddRows(1),'wizard-add-five':()=>wizardAddRows(5),'wizard-remove-empty':()=>wizardRemoveEmpty(),
    'wizard-collapse':()=>wizardSetExpanded(false),'wizard-expand':()=>wizardSetExpanded(true),'wizard-back':()=>wizardStep(-1),'wizard-next':()=>wizardStep(1),
    'wizard-save':()=>saveTaskWizard(), 'import-save':()=>saveImportRows(), 'preview-local-file':()=>previewLocalPending(Number(el.dataset.index)),
    'close-confirm':()=>closeConfirm(),
    'quick-flow-open':()=>QuickFlow.open(), 'quick-flow-close':()=>QuickFlow.close(), 'quick-flow-step':()=>QuickFlow.setStep(Number(el.dataset.step)),
    'quick-flow-next':()=>QuickFlow.next(), 'quick-flow-back':()=>QuickFlow.back(),
    'quick-flow-add-project':()=>QuickFlow.addRows('project',Number(el.dataset.count||1)), 'quick-flow-add-task':()=>QuickFlow.addRows('task',Number(el.dataset.count||1),el.dataset.projectTempid||''),
    'quick-flow-remove-empty':()=>QuickFlow.removeEmpty(el.dataset.kind), 'quick-flow-collapse-all':()=>QuickFlow.setExpanded(el.dataset.kind,false), 'quick-flow-expand-all':()=>QuickFlow.setExpanded(el.dataset.kind,true),
    'quick-flow-toggle-row':()=>QuickFlow.rowAction(el.dataset.kind,el.dataset.tempid,'toggle'), 'quick-flow-toggle-project-tasks':()=>QuickFlow.toggleProjectTasks(el.dataset.projectTempid), 'quick-flow-duplicate-row':()=>QuickFlow.rowAction(el.dataset.kind,el.dataset.tempid,'duplicate'), 'quick-flow-delete-row':()=>QuickFlow.rowAction(el.dataset.kind,el.dataset.tempid,'delete'),
    'quick-flow-file-trigger':()=>QuickFlow.triggerFile(el.dataset.kind,el.dataset.tempid), 'quick-flow-remove-file':()=>QuickFlow.removeFile(el.dataset.kind,el.dataset.tempid,Number(el.dataset.fileindex)),
    'quick-flow-save':()=>QuickFlow.saveAll()
  };
  if(map[action]) return map[action]();
  if(action==='reflection-file-trigger') return showToast('Tệp đính kèm','Phiên bản này hỗ trợ đăng chủ đề và nội dung phản tư; chức năng tải tệp sẽ được nối tiếp sau.','info',4500);
  if(action==='combo-select') return selectComboOption(el.dataset.value,el.dataset.label);
  if(action==='edit-project') return openProjectModal(el.dataset.id);
  if(action==='view-project') return openProjectProfile(el.dataset.id);
  if(action==='delete-project') return confirmDelete('projects',el.dataset.id,'dự án');
  if(action==='edit-task') return openTaskWizard(el.dataset.id);
  if(action==='view-task') return openTaskProfile(el.dataset.id);
  if(action==='delete-task') return confirmDelete('tasks',el.dataset.id,'công việc');
  if(action==='task-status') return openTaskStatusModal(el.dataset.id);
  if(action==='confirm-task') return openConfirmTaskModal(el.dataset.id);
  if(action==='reopen-task') return openReopenTaskModal(el.dataset.id);
  if(action==='edit-employee') return openEmployeeModal(el.dataset.id);
  if(action==='view-employee') return openEmployeeProfile(el.dataset.id);
  if(action==='delete-employee') return confirmDelete('employees',el.dataset.id,'nhân sự');
  if(action==='delete-kpi') return confirmDelete('kpiMonths',el.dataset.id,'KPI tháng');
  if(action==='view-file') return previewUploadedFile(el.dataset.fileId,el.dataset.docId);
  if(action==='delete-file') return confirmDeleteFile(el.dataset.id);
  if(action==='edit-user') return openUserModal(el.dataset.id);
  if(action==='delete-user') return confirmDelete('users',el.dataset.id,'người dùng');
  if(action==='edit-category') return openCategoryModal(el.dataset.group,decodeURIComponent(el.dataset.value||''));
  if(action==='delete-category') return confirmCategoryDelete(el.dataset.group,decodeURIComponent(el.dataset.value||''));
  if(action==='evaluate-kpi') return openKpiEvaluationModal(el.dataset.id);
  if(action==='finalize-kpi') return confirmFinalizeKpi(el.dataset.id);
  if(action==='view-kpi') return openKpiProfile(el.dataset.id);
  if(action==='edit-template') return openKpiTemplateModal(el.dataset.id);
  if(action==='view-template') return openKpiTemplateProfile(el.dataset.id);
  if(action==='delete-template') return confirmDelete('kpiTemplates',el.dataset.id,'mẫu KPI');
  if(action==='report-select') return renderReportDetail(el.dataset.report);
  if(action==='help-go') return changePage(el.dataset.page);
  if(action==='wizard-remove-row') return wizardRemoveRow(el.dataset.tempid);
  if(action==='wizard-duplicate-row') return wizardDuplicateRow(el.dataset.tempid);
  if(action==='wizard-toggle-row') return wizardToggleRow(el.dataset.tempid);
  if(action==='wizard-remove-file') return wizardRemoveFile(el.dataset.tempid,Number(el.dataset.fileindex));
  if(action==='remove-pending-file') return removePendingFile(Number(el.dataset.index));
  if(action==='view-switch') return setView(el.dataset.module,el.dataset.view);
  if(action==='tab-switch') return setSubTab(el.dataset.group,el.dataset.value);
  if(action==='page-go') return setPageNo(el.dataset.module,Number(el.dataset.page));
  if(action==='bulk-action') return bulkAction(el.dataset.module,el.dataset.bulk);
  if(action==='apply-filter') return openFilterPopover(el.dataset.module,el);
  if(action==='filter-option') return toggleFilterOption(el.dataset.module,el.dataset.field,decodeURIComponent(el.dataset.value||''));
  if(action==='remove-filter') return removeFilter(el.dataset.module,el.dataset.field,decodeURIComponent(el.dataset.value||''));
  if(action==='save-project') return saveProjectModal();
  if(action==='save-employee') return saveEmployeeModal();
  if(action==='save-user') return saveUserModal();
  if(action==='save-category') return saveCategoryModal();
  if(action==='save-template') return saveKpiTemplateModal();
  if(action==='save-upload') return saveUploadModal();
  if(action==='save-kpi-create') return saveCreateKpiModal();
  if(action==='save-kpi-evaluation') return saveKpiEvaluationModal();
  if(action==='save-task-status') return saveTaskStatusModal();
  if(action==='save-task-confirm') return saveTaskConfirmModal(el);
  if(action==='save-task-reopen') return saveTaskReopenModal(el);
  if(action==='save-custom-period') return saveCustomPeriod();
  if(action==='import-file-trigger') return document.getElementById('import-file-input')?.click();
  if(action==='choose-upload-files') return document.getElementById('generic-upload-input')?.click();
  if(action==='wizard-file-trigger') return document.querySelector(`input[data-wizard-file="${el.dataset.tempid}"]`)?.click();
  if(action==='toggle-help') return toggleHelpItem(el);
  if(action==='profile-tab') return renderProfileTab(el.dataset.type,el.dataset.id,el.dataset.tab);
  if(action==='download-file-link') return openExternal(el.dataset.url);
}

function handleInput(e){
const search = e.target.closest('[data-search-module]');

if (search) {
  const module = search.dataset.searchModule;
  const value = search.value;
  const start = search.selectionStart;
  const end = search.selectionEnd;

  // Cập nhật từ khóa ngay lập tức
  APP.state.search[module] = value;
  APP.state.pageNo[module] = 1;

  clearTimeout(APP.timers['search_' + module]);

  APP.timers['search_' + module] = setTimeout(() => {
    // Vẽ lại danh sách theo từ khóa mới nhất
    renderCurrentPage();

    // Tìm lại ô tìm kiếm sau khi giao diện được vẽ lại
    const input = [...document.querySelectorAll('[data-search-module]')]
      .find(el => el.dataset.searchModule === module);

    if (input) {
      input.value = APP.state.search[module] || '';
      input.focus({ preventScroll: true });

      try {
        input.setSelectionRange(start, end);
      } catch (_) {}
    }
  }, 250);}
  if(e.target.matches('[data-wizard-field]')) updateWizardInput(e.target);
  if(e.target.matches('[data-multi-search]')) filterMultiOptions(e.target);
  if(e.target.closest('.combo') && e.target.matches('.combo-display')) filterCombo(e.target.closest('.combo'),e.target.value);
  const featureSearch=e.target.closest('[data-feature-search]');
  if(featureSearch){const module=featureSearch.dataset.featureSearch;const f=getFeatureFilterState(module);f.search=featureSearch.value;clearTimeout(APP.timers['feature_'+module]);APP.timers['feature_'+module]=setTimeout(()=>renderCurrentPage(),180);}
}

function handleChange(e){
  if(typeof QuickFlow!=='undefined' && QuickFlow.handleChange(e)) return;
  if(e.target.matches('[data-row-select]')) toggleRowSelection(e.target.dataset.module,e.target.dataset.id,e.target.checked);
  if(e.target.matches('[data-select-all]')) toggleSelectAll(e.target.dataset.module,e.target.checked);
  if(e.target.matches('[data-page-size]')){APP.state.pageSize[e.target.dataset.pageSize]=Number(e.target.value);APP.state.pageNo[e.target.dataset.pageSize]=1;renderCurrentPage();}
  if(e.target.matches('[data-sort]')){APP.state.sort[e.target.dataset.sort]=e.target.value;renderCurrentPage();}
  if(e.target.id==='generic-upload-input') setPendingFiles([...e.target.files]);
  if(e.target.id==='import-file-input') handleImportXlsxFile(e.target.files[0]);
  if(e.target.matches('[data-wizard-file]')) wizardSetFiles(e.target.dataset.wizardFile,[...e.target.files]);
  if(e.target.matches('[data-multi-person],[data-multi-all]')) updateMultiPerson(e.target);
  if(e.target.matches('[data-feature-filter]')){const f=getFeatureFilterState(e.target.dataset.featureFilter);f[e.target.dataset.filterKey]=e.target.value||'';renderCurrentPage();}
  if(e.target.matches('[data-feature-date]')){const f=getFeatureFilterState(e.target.dataset.featureDate);f[e.target.dataset.filterKey]=e.target.value||'';renderCurrentPage();}
}

function handleKeydown(e){
  if(e.key==='Escape'){closeComboMenu();hideTooltipPortal();hideEl('user-dropdown');hideEl('period-menu');}
  if(e.target.closest('.combo')) handleComboKeyboard(e);
}



/* ========================= ĐỘI/NHÓM ========================= */

function ensureTeamUiStyles(){
 if(document.getElementById('team-ui-styles'))return;
 const style=document.createElement('style');style.id='team-ui-styles';
 style.textContent=`
 .teams-page-grid{display:grid;grid-template-columns:repeat(4,minmax(240px,1fr));gap:12px;align-items:stretch}
 .team-card-v2{background:#fff;border:1px solid #dbe4f3;border-radius:18px;padding:16px;box-shadow:0 8px 22px rgba(20,45,90,.06);min-width:0;display:flex;flex-direction:column;gap:12px}
 .team-card-v2 .team-card-head{display:flex;align-items:center;gap:11px;min-width:0;padding-bottom:12px;border-bottom:1px solid #dbe4f3}
 .team-card-v2 .team-logo{width:46px;height:46px;border-radius:50%;overflow:hidden;flex:0 0 46px;display:grid;place-items:center;background:linear-gradient(145deg,#16a34a,#15803d);color:#fff}
 .team-card-v2 .team-logo img{width:100%;height:100%;object-fit:cover}
 .team-card-v2 .team-title{flex:1;min-width:0}
 .team-card-v2 .team-title h2{font-size:14px;line-height:1.35;margin:0;color:#17233d;font-weight:750;overflow-wrap:anywhere}
 .team-card-v2 .team-title p{font-size:11px;color:#667792;line-height:1.4;margin:3px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
 .team-card-v2 .team-status{font-size:10px;font-weight:700;white-space:nowrap;padding:4px 8px;border-radius:999px;background:#f2f4f7;border:1px solid #dfe5ee;color:#475467}
 .team-card-v2 .team-status.active{background:#ecfdf3;color:#027a48;border-color:#abefc6}
 .team-card-v2 .team-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 10px;flex:1}
 .team-card-v2 .team-info-item small{display:block;color:#667792;font-size:10px;margin-bottom:4px}
 .team-card-v2 .team-info-item strong{display:block;color:#17233d;font-size:11px;line-height:1.4;overflow-wrap:anywhere}
 .team-card-v2 .team-members-head{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#344054;padding-top:2px}
 .team-card-v2 .team-member-list{display:flex;flex-wrap:wrap;gap:6px;max-height:100px;overflow:auto}
 .team-card-v2 .team-member-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid #e1e8f4;background:#f8faff;border-radius:999px;padding:4px 7px;font-size:10px;color:#344054;max-width:100%}
 .team-card-v2 .team-member-chip img,.team-card-v2 .team-member-chip .team-avatar{width:20px;height:20px;flex:0 0 20px;border-radius:50%;object-fit:cover;display:grid;place-items:center;background:#e7f5ed;color:#16803d;font-size:9px;font-weight:700}
 .team-card-v2 .team-member-chip span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .team-card-v2 .team-actions{display:flex;justify-content:flex-end;gap:6px;padding-top:2px}
 .team-card-v2 .team-actions .btn{min-height:32px}
 .team-modal-v2{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
 .team-modal-v2 .team-basic-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
 .team-modal-v2 .team-basic-grid .field.full{grid-column:1/-1}
 .team-modal-v2 .field{display:flex;flex-direction:column;gap:7px;min-width:0}
 .team-modal-v2 .field>label,.team-modal-v2 .field>span{display:block;font-size:12px;font-weight:650;color:#17233d;line-height:1.4}
 .team-modal-v2 .field input:not([type="checkbox"]),.team-modal-v2 .field select,.team-modal-v2 .field textarea{width:100%;max-width:100%;box-sizing:border-box;min-height:40px;border:1px solid #d4def0;border-radius:12px;background:#fff;color:#17233d;padding:10px 12px;font:inherit;outline:none;transition:border-color .15s,box-shadow .15s}
 .team-modal-v2 .field input:focus,.team-modal-v2 .field select:focus,.team-modal-v2 .field textarea:focus{border-color:#8da9e8;box-shadow:0 0 0 3px rgba(79,115,210,.10)}
 .team-modal-v2 .team-description-field{width:100%;min-width:0}
 .team-modal-v2 .team-description-field .rich-source{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important;opacity:0!important;pointer-events:none!important}
 .team-modal-v2 .team-description-field .rich-editor{display:block;width:100%;max-width:100%;box-sizing:border-box;border:1px solid #dbe4f3;border-radius:14px;overflow:visible;background:#fff;position:relative}
 .team-modal-v2 .team-description-field .rich-toolbar{display:flex;flex-wrap:wrap;align-items:flex-start;gap:6px;padding:10px 12px;border-bottom:1px solid #dbe4f3;border-radius:14px 14px 0 0;background:#f7f9fe;box-sizing:border-box;max-width:100%}
 .team-modal-v2 .team-description-field .rich-editable{display:block;width:100%;min-height:180px;max-height:420px;overflow:auto;box-sizing:border-box;padding:16px;color:#17233d;background:#fff;border:0;border-radius:0 0 14px 14px;outline:none;cursor:text;white-space:pre-wrap;overflow-wrap:anywhere;font-family:"Times New Roman",serif;font-size:14px;line-height:1.6;pointer-events:auto;user-select:text}
 .team-modal-v2 .team-description-field .rich-editable:focus{box-shadow:inset 0 0 0 2px rgba(79,115,210,.10)}
 .team-modal-v2 .team-description-field .rich-editable:empty:before{content:attr(data-placeholder);color:#8a9ab5;pointer-events:none}
 .team-modal-v2 .team-description-field .rich-toolbar button,.team-modal-v2 .team-description-field .rich-toolbar select{cursor:pointer;pointer-events:auto}
 .team-modal-v2 .field small{font-size:11px;line-height:1.5;color:#667792}
 .team-modal-v2 .team-logo-preview-wrap{align-items:center;flex-wrap:wrap}
 .team-modal-v2 .form-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
 .team-logo-preview-wrap{display:flex;align-items:center;gap:12px;margin-top:8px}
 .team-logo-preview{width:58px;height:58px;border-radius:14px;border:1px solid #dbe4f3;background:#f8faff;display:grid;place-items:center;overflow:hidden;color:#667792;flex:0 0 58px}
 .team-logo-preview img{width:100%;height:100%;object-fit:cover}
 .team-picker-v2{border:1px solid #dbe4f3;border-radius:16px;padding:0;overflow:hidden;background:#f8faff;min-width:0}
 .team-picker-v2 legend{padding:0 4px;font-weight:700;color:#17233d;font-size:13px}
 .team-picker-v2 .team-picker-top{padding:12px;border-bottom:1px solid #e3eaf5;background:#f8faff}
 .team-picker-v2 .team-picker-search{position:relative}
 .team-picker-v2 .team-picker-search input{width:100%;height:40px;border:1px solid #d4def0;border-radius:12px;background:#fff;padding:0 12px 0 38px;font:inherit;box-sizing:border-box}
 .team-picker-v2 .team-picker-search .material-symbols-rounded{position:absolute;left:12px;top:10px;color:#7a8aa5;font-size:19px}
 .team-picker-v2 .team-picker-selectall{display:flex;align-items:center;gap:10px;padding:11px 13px;border-bottom:1px solid #e3eaf5;background:#f8faff;cursor:pointer}
 .team-picker-v2 .team-picker-selectall input,.team-picker-v2 .team-member-option input{width:16px;height:16px;accent-color:#16a34a;flex:0 0 auto}
 .team-picker-v2 .team-picker-selectall strong{display:block;font-size:12px;color:#17233d}
 .team-picker-v2 .team-picker-selectall small{display:block;font-size:10px;color:#667792;margin-top:2px}
 .team-picker-v2 .team-member-options{max-height:270px;overflow:auto;background:#fff}
 .team-picker-v2 .team-member-option{display:flex!important;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid #f0f3f8;cursor:pointer;min-width:0}
 .team-picker-v2 .team-member-option:hover{background:#f6fbf8}
 .team-picker-v2 .team-member-option .team-option-avatar{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;flex:0 0 28px;background:#e4f3eb;color:#16803d;font-size:10px;font-weight:700;overflow:hidden}
 .team-picker-v2 .team-member-option .team-option-avatar img{width:100%;height:100%;object-fit:cover}
 .team-picker-v2 .team-member-option .team-option-name{min-width:0;flex:1;font-size:11px;font-weight:650;color:#26354d;overflow-wrap:anywhere}
 .team-picker-v2 .team-member-option .team-option-id{font-size:10px;color:#71819b;white-space:nowrap}
 .team-picker-v2 .team-picker-foot{padding:8px 12px;font-size:11px;color:#667792;background:#f8faff;border-top:1px solid #e3eaf5}
 .team-picker-v2 .team-picker-summary{display:flex;flex-direction:column;gap:3px;margin-bottom:10px}
 .team-picker-v2 .team-picker-summary strong{font-size:12px;color:#17233d}
 .team-picker-v2 .team-picker-summary span{font-size:10px;color:#71819b}
 .team-picker-v2 .team-member-options{max-height:360px;overflow:auto;background:#fff}
 .team-picker-v2 .team-member-option{display:flex!important;align-items:center;gap:11px;padding:10px 12px;border-bottom:1px solid #edf1f7;cursor:pointer;min-width:0;transition:background .15s}
 .team-picker-v2 .team-member-option.is-selected{background:#f0faf4}
 .team-picker-v2 .team-member-option input{margin:0}
 .team-picker-v2 .team-member-option .avatar{width:38px!important;height:38px!important;flex:0 0 38px;border-radius:50%;overflow:hidden}
 .team-picker-v2 .team-member-option .avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
 .team-picker-v2 .team-option-main{display:flex;flex:1;min-width:0;flex-direction:column;gap:3px}
 .team-picker-v2 .team-option-name{font-size:12px;font-weight:700;color:#1d2d46;line-height:1.35}
 .team-picker-v2 .team-option-meta{font-size:10px;color:#5d6f8b;line-height:1.35}
 .team-picker-v2 .team-option-contact{display:flex;gap:10px;flex-wrap:wrap;font-size:10px;color:#8290a6;overflow-wrap:anywhere}
 .team-picker-v2 .team-option-side{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex:0 0 auto}
 .team-picker-v2 .team-option-id{font-size:10px;color:#71819b;white-space:nowrap}
 .team-picker-v2 .team-option-status{font-size:9px;color:#16803d;background:#e9f8ef;border-radius:999px;padding:3px 6px;white-space:nowrap}
 .team-picker-v2 .team-picker-empty{padding:22px 14px;text-align:center;color:#7b8799;font-size:12px;background:#fff}
 .team-picker-v2 .team-member-option .avatar-lazy.avatar-loading{opacity:.6}
 .team-card-v2 .team-member-chip{padding:5px 8px}
 .team-card-v2 .team-member-chip .avatar{width:24px!important;height:24px!important;flex:0 0 24px}
 .team-card-v2 .team-member-chip small{font-size:9px;color:#7b8799}
 @media(max-width:600px){.team-picker-v2 .team-option-contact{display:none}.team-picker-v2 .team-option-side{max-width:76px}.team-picker-v2 .team-option-id{font-size:9px}}

 @media(max-width:1200px){.teams-page-grid{grid-template-columns:repeat(3,minmax(220px,1fr))}}
 @media(max-width:900px){.teams-page-grid{grid-template-columns:repeat(2,minmax(220px,1fr))}}
 @media(max-width:600px){.teams-page-grid{grid-template-columns:1fr}.team-modal-v2 .team-basic-grid{grid-template-columns:1fr}.team-modal-v2 .team-basic-grid .field.full{grid-column:auto}.team-modal-v2 .team-description-field .rich-toolbar{gap:4px;padding:8px}.team-modal-v2 .team-description-field .rich-editable{min-height:160px;padding:12px}.team-picker-v2 .team-member-option .team-option-id{display:none}}
 `;
 document.head.appendChild(style);
}
function teamInitial(name){return String(name||'?').trim().slice(0,1).toLocaleUpperCase('vi');}

function renderTeams(){
  ensureTeamUiStyles();
  const root=document.getElementById('page-content'); if(!root)return;
  const canManage=['Quản trị','Quản lý'].includes(APP.session?.role);
  root.innerHTML=`<div class="page-shell">
    ${pageHead('Đội/Nhóm','Tổ chức các đội theo nhiệm vụ, logo riêng, người quản lý và danh sách thành viên.',canManage?`<button class="btn btn-primary" data-action="team-new"><span class="material-symbols-rounded">add</span>Thêm đội/nhóm</button>`:'')}
    <div class="section-title-row" style="margin:0 0 12px"><span style="color:var(--muted);font-size:13px">Danh sách đội/nhóm đang hoạt động</span><button class="btn btn-sm" data-action="teams-refresh"><span class="material-symbols-rounded">refresh</span>Làm mới</button></div>
    <div id="teams-grid" class="teams-page-grid"><div class="panel empty-state"><span class="material-symbols-rounded">progress_activity</span><strong>Đang tải đội/nhóm...</strong></div></div>
  </div>`;
  loadTeams();
}
async function loadTeams(){
  const root=document.getElementById('teams-grid'); if(!root)return;
  root.innerHTML=`<div class="panel empty-state"><span class="material-symbols-rounded">progress_activity</span><strong>Đang tải...</strong></div>`;
  try{
    const rows=await gas('getTeams',APP.token,{timeout:60000});
    APP.state.teams=Array.isArray(rows)?rows:[];
    APP.data.teams=APP.state.teams;
    if(APP.state.page!=='teams')return;
    renderTeamsFeed(APP.state.teams);
  }catch(err){root.innerHTML=`<div class="panel empty-state"><span class="material-symbols-rounded">error</span><strong>Không thể tải Đội/Nhóm</strong><p>${escapeHtml(err.message||'Đã xảy ra lỗi.')}</p><button class="btn btn-primary" data-action="teams-refresh">Thử lại</button></div>`;}
}
function renderTeamsFeed(rows){
 ensureTeamUiStyles();
 const root=document.getElementById('teams-grid');if(!root)return;
 const canManage=['Quản trị','Quản lý'].includes(APP.session?.role);
 if(!rows.length){root.innerHTML=`<div class="panel empty-state"><span class="material-symbols-rounded">diversity_3</span><strong>Chưa có đội/nhóm</strong><p>${canManage?'Chọn “Thêm đội/nhóm” để tạo đội đầu tiên.':'Các đội/nhóm sẽ hiển thị tại đây khi được tạo.'}</p></div>`;return;}
 root.innerHTML=rows.map(t=>{
   const members=Array.isArray(t.members)?t.members:[];
   const logo=t.logoUrl?`<img src="${escapeAttr(t.logoUrl)}" alt="Logo ${escapeAttr(t.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">`:'';
   return `<article class="team-card-v2">
    <div class="team-card-head">
      <div class="team-logo">${logo}<span class="material-symbols-rounded" ${t.logoUrl?'style="display:none"':''}>diversity_3</span></div>
      <div class="team-title"><h2>${escapeHtml(t.name||'Chưa đặt tên')}</h2><p>${escapeHtml(t.id||'')} · ${escapeHtml(t.description||'Chưa có mô tả')}</p></div>
      <span class="team-status ${t.status==='Hoạt động'?'active':''}">${escapeHtml(t.status||'Chưa xác định')}</span>
    </div>
    <div class="team-info-grid">
      <div class="team-info-item"><small>Người quản lý</small><strong>${escapeHtml(t.managerName||'Chưa phân công')}</strong></div>
      <div class="team-info-item"><small>Số thành viên</small><strong>${members.length} thành viên</strong></div>
      <div class="team-info-item"><small>Nhiệm vụ</small><strong>${escapeHtml(t.description||'Chưa cập nhật')}</strong></div>
      <div class="team-info-item"><small>Trạng thái</small><strong>${escapeHtml(t.status||'Chưa xác định')}</strong></div>
    </div>
    <div class="team-members-head"><strong>Thành viên đội</strong><span class="badge">${members.length}</span></div>
    <div class="team-member-list">${members.length?members.map(m=>`<span class="team-member-chip">${avatarHtml(m.id||m.employeeId,24)}<span>${escapeHtml(m.name||'Chưa rõ tên')}</span><small>${escapeHtml(m.role||'')}</small></span>`).join(''):`<span class="team-no-members">Chưa có thành viên được thêm.</span>`}</div>
    ${canManage?`<div class="team-actions"><button class="btn btn-sm" data-action="team-edit" data-id="${escapeAttr(t.id)}"><span class="material-symbols-rounded">edit</span>Chỉnh sửa</button><button class="btn btn-sm btn-danger" data-action="team-delete" data-id="${escapeAttr(t.id)}"><span class="material-symbols-rounded">delete</span>Xóa vĩnh viễn</button></div>`:''}
   </article>`;
 }).join('');
 if(typeof initLazyEmployeeAvatars==='function')initLazyEmployeeAvatars(root);
}
async function openTeamModal(id=''){
 ensureTeamUiStyles();
 if(!['Quản trị','Quản lý'].includes(APP.session?.role)){
   showToast('Không đủ quyền','Chỉ Quản trị/Quản lý được quản lý đội nhóm.','error');
   return;
 }

 // Làm mới hồ sơ nhân sự từ nguồn dữ liệu chung trước khi hiển thị danh sách chọn.
 const loadingToast=showToast('Đang đồng bộ nhân sự','Đang lấy hồ sơ, ảnh đại diện và thông tin thành viên mới nhất.','processing',0);
 try{
   const fresh=await gas('getBootstrapData',APP.token,{timeout:90000});
   if(fresh && Array.isArray(fresh.employees)){
     APP.data=Object.assign({},APP.data||{},fresh);
     APP.session=fresh.session||APP.session;
     APP.permissions=fresh.permissions||APP.permissions;
     if(Array.isArray(fresh.teams))APP.state.teams=fresh.teams;
   }
   updateToast(loadingToast,'Đã đồng bộ nhân sự','Danh sách thành viên đã được cập nhật.','success',1800);
 }catch(err){
   updateToast(loadingToast,'Chưa thể làm mới dữ liệu',err.message||'Sẽ sử dụng dữ liệu nhân sự đang có.','warning',3500);
   if(!Array.isArray(APP.data?.employees)||!APP.data.employees.length){
     showToast('Không có dữ liệu nhân sự','Không thể mở danh sách vì chưa tải được hồ sơ nhân sự.','error',5000);
     return;
   }
 }

 const existing=(APP.state.teams||[]).find(t=>String(t.id)===String(id));
 if(id&&!existing){showToast('Không tìm thấy đội/nhóm','Đội/nhóm có thể đã được cập nhật hoặc xóa.','error');return;}

 const allEmployees=Array.isArray(APP.data?.employees)?APP.data.employees:[];
 const isEmployeeActive=e=>{
   const status=normalizeText(e?.['Trạng thái']||'');
   return !status || !['da nghi','nghi viec','ngung hoat dong','tam khoa','tam nghi','inactive','deleted'].includes(status);
 };
 const activeEmployees=allEmployees
   .filter(e=>String(e?.['Mã nhân sự']||'').trim()&&isEmployeeActive(e))
   .sort((x,y)=>String(x['Họ và tên']||'').localeCompare(String(y['Họ và tên']||''),'vi'));

 const opt=selected=>`<option value="">-- Chưa phân công --</option>`+
   activeEmployees.map(e=>{
     const code=String(e['Mã nhân sự']||'').trim();
     return `<option value="${escapeAttr(code)}" ${String(selected||'')===code?'selected':''}>${escapeHtml(e['Họ và tên']||code)} (${escapeHtml(code)})</option>`;
   }).join('');

 const selectedMembers=(existing?.memberIds||[]).map(x=>String(x||'').trim());
 const memberRows=activeEmployees.map(e=>{
   const name=String(e['Họ và tên']||'Chưa rõ tên');
   const code=String(e['Mã nhân sự']||'').trim();
   const group=String(e['Nhóm']||'Chưa phân nhóm');
   const position=String(e['Chức vụ']||'Chưa cập nhật chức vụ');
   const email=String(e['Email']||'');
   const phone=String(e['Số điện thoại']||'');
   const status=String(e['Trạng thái']||'Đang hoạt động');
   const search=normalizeText([name,code,group,position,email,phone,status].join(' '));
   const checked=selectedMembers.includes(code);
   return `<label class="team-member-option ${checked?'is-selected':''}" data-search="${escapeAttr(search)}" data-employee-id="${escapeAttr(code)}">
     <input type="checkbox" value="${escapeAttr(code)}" ${checked?'checked':''} aria-label="Chọn ${escapeAttr(name)}" onchange="updateTeamMemberCount()">
     ${avatarHtml(code,38)}
     <span class="team-option-main">
       <strong class="team-option-name">${escapeHtml(name)}</strong>
       <span class="team-option-meta">${escapeHtml(position)} · ${escapeHtml(group)}</span>
       <span class="team-option-contact">${email?`<span>${escapeHtml(email)}</span>`:''}${phone?`<span>${escapeHtml(phone)}</span>`:''}</span>
     </span>
     <span class="team-option-side">
       <small class="team-option-id">${escapeHtml(code)}</small>
       <small class="team-option-status">${escapeHtml(status)}</small>
     </span>
   </label>`;
 }).join('');

 openModal(modalShell(`${id?'Chỉnh sửa':'Tạo'} đội/nhóm`,'Thông tin đội, người quản lý và thành viên được lấy trực tiếp từ hồ sơ Nhân sự của hệ thống.',`
 <form id="team-form" class="team-modal-v2">
  <div class="team-basic-grid">
   <label class="field full"><span>Tên đội/nhóm *</span><input id="team-name" required maxlength="120" value="${escapeAttr(existing?.name||'')}" placeholder="Ví dụ: Đội Truyền thông"></label>
   <div class="field full team-description-field"><label for="team-description">Mô tả / nhiệm vụ</label><textarea id="team-description" rows="5" maxlength="10000" placeholder="Mục tiêu và nhiệm vụ của đội">${escapeHtml(existing?.description||'')}</textarea><small>Nhấp vào vùng soạn thảo để nhập nội dung. Có thể định dạng chữ, danh sách và chèn bảng.</small></div>
   <div class="field full"><label for="team-logo"><span>Logo đội/nhóm (URL hình ảnh)</span></label><input id="team-logo" type="url" value="${escapeAttr(existing?.logoUrl||'')}" placeholder="https://..."><small>Dán liên kết ảnh công khai. Ảnh sẽ được xem trước bên dưới.</small><div class="team-logo-preview-wrap"><div class="team-logo-preview" id="team-logo-preview">${existing?.logoUrl?`<img src="${escapeAttr(existing.logoUrl)}" alt="Xem trước logo" onerror="this.remove();this.parentElement.innerHTML='<span class=&quot;material-symbols-rounded&quot;>image</span>'">`:'<span class="material-symbols-rounded">diversity_3</span>'}</div><small>Ưu tiên URL HTTPS trực tiếp tới tệp ảnh PNG, JPG, WEBP hoặc GIF.</small></div></div>
   <label class="field"><span>Người quản lý</span><select id="team-manager">${opt(existing?.managerId||'')}</select></label>
   <label class="field"><span>Trạng thái</span><select id="team-status"><option ${(!existing||existing.status==='Hoạt động')?'selected':''}>Hoạt động</option><option ${existing?.status==='Tạm ngưng'?'selected':''}>Tạm ngưng</option></select></label>
  </div>
  <fieldset class="team-picker-v2">
   <legend>Người tham gia <span class="badge" id="team-member-count">${selectedMembers.length}</span></legend>
   <div class="team-picker-top">
    <div class="team-picker-summary"><strong>${activeEmployees.length} nhân sự đang hoạt động</strong><span>Đồng bộ từ module Nhân sự · Ảnh đại diện lấy từ hồ sơ gốc</span></div>
    <div class="team-picker-search"><span class="material-symbols-rounded">search</span><input id="team-member-search" type="search" autocomplete="off" placeholder="Tìm theo tên, mã, Nhóm, chức vụ, email hoặc số điện thoại..." oninput="filterTeamMembers(this.value)"></div>
   </div>
   <label class="team-picker-selectall"><input id="team-member-select-all" type="checkbox" onchange="toggleAllTeamMembers(this.checked)"><span><strong>Chọn tất cả thành viên</strong><small>Chọn hoặc bỏ chọn toàn bộ ${activeEmployees.length} nhân sự đang hoạt động</small></span></label>
   <div id="team-member-options" class="team-member-options">${memberRows||'<div class="team-picker-empty">Không có hồ sơ nhân sự đang hoạt động trong phạm vi tài khoản.</div>'}</div>
   <div class="team-picker-foot" id="team-member-help">Đã chọn ${selectedMembers.length}/${activeEmployees.length} thành viên.</div>
  </fieldset>
  <div class="form-actions"><button type="button" class="btn" data-action="close-modal">Hủy</button><button type="button" class="btn btn-primary" data-action="team-save" data-id="${escapeAttr(id)}"><span class="material-symbols-rounded">save</span>Lưu đội/nhóm</button></div>
 </form>`,`<button type="button" class="btn" data-action="close-modal">Đóng</button>`));

 const logoInput=document.getElementById('team-logo');
 if(logoInput)logoInput.addEventListener('input',updateTeamLogoPreview);
 const modalRoot=document.getElementById('modal-root');
 if(typeof initLazyEmployeeAvatars==='function')initLazyEmployeeAvatars(modalRoot||document);
 updateTeamMemberCount();
}

function updateTeamLogoPreview(){
 const input=document.getElementById('team-logo'),preview=document.getElementById('team-logo-preview');if(!input||!preview)return;
 const url=input.value.trim();
 if(!url){preview.innerHTML='<span class="material-symbols-rounded">diversity_3</span>';return;}
 try{const parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol))throw new Error('URL không hợp lệ');preview.innerHTML=`<img src="${escapeAttr(url)}" alt="Xem trước logo">`;preview.querySelector('img').onerror=()=>{preview.innerHTML='<span class="material-symbols-rounded">broken_image</span>';};}
 catch(e){preview.innerHTML='<span class="material-symbols-rounded">broken_image</span>';}
}
function updateTeamMemberCount(){
 const rows=[...document.querySelectorAll('#team-member-options .team-member-option')];
 const boxes=rows.map(row=>row.querySelector('input[type="checkbox"]')).filter(Boolean);
 const checked=boxes.filter(x=>x.checked).length;
 const count=document.getElementById('team-member-count');
 const help=document.getElementById('team-member-help');
 const all=document.getElementById('team-member-select-all');
 if(count)count.textContent=checked;
 if(help)help.textContent=`Đã chọn ${checked}/${boxes.length} thành viên.`;
 rows.forEach(row=>row.classList.toggle('is-selected',!!row.querySelector('input[type="checkbox"]')?.checked));
 if(all){all.checked=boxes.length>0&&checked===boxes.length;all.indeterminate=checked>0&&checked<boxes.length;}
}
function toggleAllTeamMembers(checked){
 document.querySelectorAll('#team-member-options .team-member-option').forEach(row=>{
   const box=row.querySelector('input[type="checkbox"]');
   if(box&&row.style.display!=='none')box.checked=checked;
 });
 updateTeamMemberCount();
}
function filterTeamMembers(q){
 const query=normalizeText(q||'');
 let visible=0;
 document.querySelectorAll('#team-member-options .team-member-option').forEach(row=>{
   const hay=row.dataset.search||normalizeText(row.textContent);
   const match=!query||hay.includes(query);
   row.style.display=match?'flex':'none';
   if(match)visible++;
 });
 const root=document.getElementById('team-member-options');
 let empty=root?.querySelector('.team-picker-no-results');
 if(root){
   if(!visible&&!empty){
     empty=document.createElement('div');
     empty.className='team-picker-empty team-picker-no-results';
     empty.textContent='Không tìm thấy nhân sự phù hợp. Hãy thử tên, mã nhân sự, Nhóm hoặc email khác.';
     root.appendChild(empty);
   }else if(visible&&empty)empty.remove();
   else if(!visible&&empty)empty.style.display='block';
 }
 updateTeamMemberCount();
}

async function saveTeam(){
 const form=document.getElementById('team-form');if(!form)return;
 const name=document.getElementById('team-name').value.trim();
 if(!name){showToast('Thiếu tên đội/nhóm','Vui lòng nhập tên đội/nhóm.','error');return;}
 const payload={id:document.querySelector('[data-action="team-save"]')?.dataset.id||'',name,description:document.getElementById('team-description').value.trim(),logoUrl:document.getElementById('team-logo').value.trim(),managerId:document.getElementById('team-manager').value,status:document.getElementById('team-status').value,memberIds:[...document.querySelectorAll('#team-member-options input[type="checkbox"]:checked')].map(x=>x.value)};
  try{
    await gas('saveTeam',payload,APP.token,{timeout:60000});
    closeModal();showToast('Đã lưu đội/nhóm',name,'success');
    await loadTeams();
    const fresh=await gas('getBootstrapData',APP.token,{timeout:90000});
    APP.data=fresh;APP.session=fresh.session;APP.permissions=fresh.permissions||APP.permissions;
    APP.state.teams=Array.isArray(fresh.teams)?fresh.teams:APP.state.teams;
    if(APP.state.page==='employees')renderEmployees();
  }catch(err){showToast('Không thể lưu đội/nhóm',err.message||'Đã xảy ra lỗi.','error',5000);}
}
async function deleteTeamFromSystem(id){
 const team=(APP.state.teams||[]).find(t=>t.id===id);if(!team)return;
 if(!confirm(`Xóa vĩnh viễn đội/nhóm “${team.name}”? Dữ liệu đội/nhóm sẽ bị xóa khỏi Google Sheets và không thể khôi phục.`))return;
  try{
    await gas('deleteTeamPermanently',id,APP.token,{timeout:60000});
    showToast('Đã xóa vĩnh viễn',team.name,'success');
    await loadTeams();
    const fresh=await gas('getBootstrapData',APP.token,{timeout:90000});
    APP.data=fresh;APP.session=fresh.session;APP.permissions=fresh.permissions||APP.permissions;
    APP.state.teams=Array.isArray(fresh.teams)?fresh.teams:APP.state.teams;
    if(APP.state.page==='employees')renderEmployees();
  }catch(err){showToast('Không thể xóa đội/nhóm',err.message||'Đã xảy ra lỗi.','error',5000);}
}

/* ========================= NEWS / BẢNG TIN ========================= */
function renderNews(){
  const root=document.getElementById('page-content');
  if(!root)return;
  const canPost=['Quản trị','Quản lý',].includes(APP.session?.role);
  root.innerHTML=`<div class="page-shell">
    ${pageHead('Bảng tin','Thông báo và chia sẻ tài liệu Khát Vọng',
      canPost?`<button class="btn btn-primary" data-action="news-new"><span class="material-symbols-rounded">add</span>Đăng bài</button>`:'')}
    <div class="panel" style="padding:16px;margin-bottom:16px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <span class="material-symbols-rounded" style="color:var(--primary)">campaign</span>
        <div style="flex:1;min-width:180px"><strong>Bảng tin Khát Vọng</strong><div style="color:var(--muted);font-size:12px">Cập nhật thông báo, hoạt động và tài liệu dùng chung.</div></div>
        <button class="btn btn-sm" data-action="news-refresh"><span class="material-symbols-rounded">refresh</span>Làm mới</button>
      </div>
    </div>
    <div id="news-feed" class="news-feed"><div class="panel empty-state"><span class="material-symbols-rounded">progress_activity</span><strong>Đang tải Bảng tin...</strong><p>Vui lòng chờ trong giây lát.</p></div></div>
  </div>`;
  loadNewsFeed();
}
async function loadNewsFeed(){
  const feed=document.getElementById('news-feed');
  if(!feed)return;
  feed.innerHTML=`<div class="panel empty-state"><span class="material-symbols-rounded">progress_activity</span><strong>Đang tải Bảng tin...</strong></div>`;
  try{
    const posts=await gas('getNewsFeed',APP.token,{timeout:60000});
    if(APP.state.page!=='news')return;
    APP.state.newsFeed=Array.isArray(posts)?posts:[];
    renderNewsFeed(APP.state.newsFeed);
  }catch(err){
    if(!document.getElementById('news-feed'))return;
    feed.innerHTML=`<div class="panel empty-state"><span class="material-symbols-rounded">error</span><strong>Không thể tải Bảng tin</strong><p>${escapeHtml(err.message||'Đã xảy ra lỗi.')}</p><button class="btn btn-primary" data-action="news-refresh">Thử lại</button></div>`;
  }
}
function renderNewsFeed(posts){
  const feed=document.getElementById('news-feed');
  if(!feed)return;
  const allPosts=Array.isArray(posts)?posts:[];
  const categories=['Tất cả','Thông báo','Hoạt động','Tài liệu','Chia sẻ'];
  const current=categories.includes(APP.state.newsCategoryTab)?APP.state.newsCategoryTab:'Tất cả';
  APP.state.newsCategoryTab=current;
  const counts=Object.fromEntries(categories.map(c=>[c,c==='Tất cả'?allPosts.length:allPosts.filter(p=>String(p.category||'Thông báo').trim()===c).length]));
  const tabs=`<div class="panel" style="padding:10px;margin-bottom:14px">
    <div role="tablist" aria-label="Phân loại bài viết Bảng tin" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">
      ${categories.slice(1).map(category=>`<button type="button" role="tab" aria-selected="${current===category}" data-action="news-category-tab" data-category="${escapeAttr(category)}" class="btn ${current===category?'btn-primary':''}" style="min-width:0;justify-content:center;white-space:normal;padding:10px 8px;border-radius:10px">
        <span style="display:flex;align-items:center;justify-content:center;gap:6px;min-width:0"><span class="material-symbols-rounded" style="font-size:18px">${category==='Thông báo'?'campaign':category==='Hoạt động'?'event':category==='Tài liệu'?'folder_open':'forum'}</span><span>${escapeHtml(category)}</span></span>
        <span class="badge" style="margin-left:4px">${counts[category]}</span>
      </button>`).join('')}
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;font-size:12px;color:var(--muted)">
      <span>Chọn loại chia sẻ để lọc bài viết.</span>
      <button type="button" class="btn btn-sm ${current==='Tất cả'?'btn-primary':''}" data-action="news-category-tab" data-category="Tất cả">Tất cả bài viết (${allPosts.length})</button>
    </div>
  </div>`;
  if(!allPosts.length){
    feed.innerHTML=tabs+`<div class="panel empty-state"><span class="material-symbols-rounded">campaign</span><strong>Chưa có bài viết</strong><p>Các thông báo và tài liệu được chia sẻ sẽ xuất hiện tại đây.</p></div>`;
    return;
  }
  const filtered=current==='Tất cả'?allPosts:allPosts.filter(p=>String(p.category||'Thông báo').trim()===current);
  if(!filtered.length){
    feed.innerHTML=tabs+`<div class="panel empty-state"><span class="material-symbols-rounded">filter_list</span><strong>Chưa có bài viết thuộc mục ${escapeHtml(current)}</strong><p>Khi có bài viết loại này, nội dung sẽ xuất hiện tại đây.</p></div>`;
    return;
  }
  const role=APP.session?.role||'';
  const canMonitor=['Quản trị','Quản lý'].includes(role);
  const isAdmin=role==='Quản trị';
  feed.innerHTML=tabs+filtered.map(post=>{
    const files=Array.isArray(post.files)?post.files:[];
    const status=post.myStatus||{};
    const isNew=!status.read;
    const fileHtml=files.length?`<div style="display:grid;gap:8px;margin-top:14px">${files.map(file=>`<a class="btn" href="${escapeAttr(file.url||file.previewUrl||'#')}" target="_blank" rel="noopener noreferrer" style="justify-content:flex-start;text-decoration:none"><span class="material-symbols-rounded">${String(file.mimeType||'').startsWith('image/')?'image':'attach_file'}</span><span style="overflow-wrap:anywhere">${escapeHtml(file.name||'Tệp đính kèm')}</span><span class="material-symbols-rounded">open_in_new</span></a>`).join('')}</div>`:'';
    const date=post.createdAt?formatDateTime(post.createdAt):'';
    const summary=post.interactionSummary||{readCount:0,questionCount:0};
    return `<article class="panel" style="padding:18px;margin-bottom:14px">
      <div style="display:flex;gap:12px;align-items:flex-start">
        <div class="avatar" style="flex-shrink:0">${escapeHtml(initials(post.author||'KV'))}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><strong>${escapeHtml(post.author||'Người dùng')}</strong><span class="badge badge-blue">${escapeHtml(post.category||'Thông báo')}</span>${isNew?'<span class="badge badge-red" style="font-weight:800;letter-spacing:.4px">NEW</span>':''}</div>
          <small style="color:var(--muted)">${escapeHtml(date)}</small>
        </div>
        ${isAdmin?`<div style="display:flex;gap:6px;align-items:center;flex-shrink:0">
          <button class="row-action" title="Ẩn bài viết" aria-label="Ẩn bài viết" data-action="news-hide" data-id="${escapeAttr(post.id)}"><span class="material-symbols-rounded">visibility_off</span></button>
          <button class="row-action danger" title="Xóa bài viết" aria-label="Xóa bài viết" data-action="news-delete" data-id="${escapeAttr(post.id)}"><span class="material-symbols-rounded">delete</span></button>
        </div>`:''}
      </div>
      <h2 style="font-size:18px;margin:14px 0 8px;overflow-wrap:anywhere">${escapeHtml(post.title||'')}</h2>
      <div class="news-post-content" style="white-space:normal;overflow-wrap:anywhere;line-height:1.7">${safeRichHtml(post.content||'')}</div>
      ${fileHtml}
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
        ${status.read?`<span class="btn btn-sm" style="pointer-events:none;opacity:.8"><span class="material-symbols-rounded">check_circle</span>Đã đọc</span>`:`<button class="btn btn-sm btn-primary" data-action="news-mark-read" data-id="${escapeAttr(post.id)}"><span class="material-symbols-rounded">mark_email_read</span>Đánh dấu đã đọc</button>`}
        <button class="btn btn-sm" data-action="news-ask-question" data-id="${escapeAttr(post.id)}"><span class="material-symbols-rounded">help</span>Gửi thắc mắc</button>
        ${canMonitor?`<span style="font-size:12px;color:var(--muted);margin-left:auto">Đã đọc: <strong>${Number(summary.readCount)||0}</strong> · Thắc mắc: <strong>${Number(summary.questionCount)||0}</strong></span><button class="btn btn-sm" data-action="news-monitor" data-id="${escapeAttr(post.id)}"><span class="material-symbols-rounded">analytics</span>Theo dõi</button>`:''}
      </div>
    </article>`;
  }).join('');
}
function openNewsQuestionModal(postId){
  const post=(APP.state.newsFeed||[]).find(p=>String(p.id)===String(postId));
  if(!post)return;
  const body=`<div class="panel" style="padding:12px;margin-bottom:14px"><strong>${escapeHtml(post.title||'Thông báo')}</strong><p style="margin:6px 0 0;color:var(--muted);font-size:13px">Thắc mắc của bạn sẽ được gắn trực tiếp với thông báo này và chỉ cấp Quản lý/Quản trị có thể theo dõi.</p></div><label class="form-field full"><span>Nội dung thắc mắc <b style="color:var(--danger)">*</b></span><textarea id="news-question-text" class="input" rows="5" maxlength="5000" placeholder="Nhập câu hỏi hoặc nội dung cần làm rõ..."></textarea></label>`;
  const footer=`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="news-question-save" data-id="${escapeAttr(postId)}"><span class="material-symbols-rounded">send</span>Gửi thắc mắc</button>`;
  openModal(modalShell('Gửi thắc mắc về thông báo','Thông báo: '+(post.title||''),body,footer,'modal-lg'));
}
async function saveNewsQuestion(postId){
  const reply=document.getElementById('news-question-text')?.value.trim()||'';
  if(!reply){showToast('Chưa có nội dung','Vui lòng nhập thắc mắc trước khi gửi.','warning');return;}
  const btn=document.querySelector('[data-action="news-question-save"]');
  setButtonBusy(btn,true,'Đang gửi');
  try{
    await gas('recordRulesQuestion',{postId,question:reply},APP.token,{timeout:60000});
    closeModal();showToast('Đã gửi thắc mắc','Thắc mắc đã được gắn với thông báo và gửi đến khu vực theo dõi của cấp quản lý.','success',4500);
    await loadNewsFeed();
  }catch(err){showToast('Không thể gửi thắc mắc',err.message||'Đã xảy ra lỗi.','error',6000);}
  finally{const b=document.querySelector('[data-action="news-question-save"]');if(b)setButtonBusy(b,false);}
}
async function markNewsRead(postId){
  try{
    await gas('recordNewsInteraction',{postId,status:'Đã đọc'},APP.token,{timeout:60000});
    const post=(APP.state.newsFeed||[]).find(p=>String(p.id)===String(postId));
    if(post)post.myStatus=Object.assign({},post.myStatus||{},{read:true,readAt:new Date().toISOString()});
    showToast('Đã đánh dấu đã đọc','Thông báo đã được ghi nhận là bạn đã đọc.','success',2500);
    await loadNewsFeed();
  }catch(err){showToast('Không thể cập nhật trạng thái',err.message||'Đã xảy ra lỗi.','error',5000);}
}
async function monitorNewsPost(postId){
  const role=APP.session?.role||'';
  if(!['Quản trị','Quản lý'].includes(role)){showToast('Không có quyền','Chỉ cấp Quản lý và Quản trị được theo dõi xác nhận đọc và thắc mắc.','warning');return;}
  try{
    const data=await gas('getRulesInteractionSummary',postId,APP.token,{timeout:60000});
    const readers=Array.isArray(data.readers)?data.readers:[];
    const unreadMembers=Array.isArray(data.unreadMembers)?data.unreadMembers:[];
    const questions=Array.isArray(data.questions)?data.questions:[];
    const readCount=Number(data.readCount)||readers.length;
    const memberCount=Number(data.memberCount)||readCount+unreadMembers.length;
    const readPercent=memberCount?Math.round(readCount*100/memberCount):0;
    const readersHtml=readers.length?`<div style="display:grid;gap:8px">${readers.map(x=>`<div class="panel" style="padding:10px"><strong>${escapeHtml(x.name||'Thành viên')}</strong><div style="font-size:12px;color:var(--muted)">Đã xác nhận đọc: ${escapeHtml(x.readAt||'')}</div></div>`).join('')}</div>`:'<p style="color:var(--muted)">Chưa có thành viên xác nhận đã đọc.</p>';
    const unreadHtml=unreadMembers.length?`<div style="display:grid;gap:8px">${unreadMembers.map(x=>`<div class="panel" style="padding:10px;display:flex;align-items:center;gap:10px"><span class="material-symbols-rounded" style="color:var(--warning,#d97706)">schedule</span><div style="min-width:0"><strong>${escapeHtml(x.name||'Thành viên')}</strong><div style="font-size:12px;color:var(--muted)">${escapeHtml(x.employeeId||x.username||'')}</div></div><span class="badge badge-orange" style="margin-left:auto">Chưa xác nhận</span></div>`).join('')}</div>`:'<p style="color:var(--success)">Tất cả thành viên trong phạm vi thống kê đã xác nhận đọc.</p>';
    const questionsHtml=questions.length?`<div style="display:grid;gap:10px">${questions.map(x=>`<div class="panel" style="padding:12px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><strong>${escapeHtml(x.name||'Thành viên')}</strong><small style="color:var(--muted)">${escapeHtml(x.createdAt||'')}</small></div><div style="white-space:pre-wrap;overflow-wrap:anywhere;margin-top:8px">${escapeHtml(x.question||'')}</div></div>`).join('')}</div>`:'<p style="color:var(--muted)">Chưa có thắc mắc nào cho thông báo này.</p>';
    const body=`<div class="panel" style="padding:14px;margin-bottom:14px"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px"><div><small style="color:var(--muted)">Đã xác nhận đọc</small><div style="font-size:24px;font-weight:800">${readCount} / ${memberCount}</div></div><div><small style="color:var(--muted)">Chưa xác nhận</small><div style="font-size:24px;font-weight:800">${unreadMembers.length}</div></div><div><small style="color:var(--muted)">Tỷ lệ xác nhận</small><div style="font-size:24px;font-weight:800">${readPercent}%</div></div><div><small style="color:var(--muted)">Thắc mắc liên quan</small><div style="font-size:24px;font-weight:800">${Number(data.questionCount)||questions.length}</div></div></div><div style="height:8px;background:var(--border);border-radius:99px;overflow:hidden;margin-top:12px"><div style="height:100%;width:${readPercent}%;background:var(--success,#16a34a);border-radius:99px"></div></div></div><h3 style="margin:14px 0 8px">Thành viên đã xác nhận đọc (${readCount})</h3>${readersHtml}<h3 style="margin:18px 0 8px">Thành viên chưa xác nhận (${unreadMembers.length})</h3>${unreadHtml}<h3 style="margin:18px 0 8px">Phản hồi và thắc mắc liên quan (${Number(data.questionCount)||questions.length})</h3>${questionsHtml}`;
    openModal(modalShell('Theo dõi thông báo',data.title||'Chi tiết tương tác',body,`<button class="btn btn-primary" data-action="close-modal">Đóng</button>`,'modal-lg'));
  }catch(err){showToast('Không thể tải báo cáo',err.message||'Đã xảy ra lỗi.','error',6000);}
}
function openNewsPostModal(){
  const body=`<div class="form-grid">
    <label class="form-field full"><span>Tiêu đề <b style="color:var(--danger)">*</b></span><input id="news-title" class="input" maxlength="200" placeholder="Nhập tiêu đề bài viết"></label>
    <label class="form-field full"><span>Loại bài viết</span><select id="news-category" class="input"><option>Thông báo</option><option>Hoạt động</option><option>Tài liệu</option><option>Chia sẻ</option></select></label>
    <label class="form-field full"><span>Nội dung</span><textarea id="news-content" class="input" rows="6" maxlength="45000" placeholder="Nhập nội dung thông báo hoặc chia sẻ..."></textarea></label>
    <label class="form-field full"><span>Tệp đính kèm (không bắt buộc)</span><input id="news-files" class="input" type="file" multiple accept="image/*,video/mp4,video/webm,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"><small style="color:var(--muted)">Tệp sẽ được tải lên sau khi bài viết được tạo. Định dạng được hỗ trợ tùy cấu hình máy chủ.</small></label>
  </div>`;
  const footer=`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="news-save"><span class="material-symbols-rounded">send</span>Đăng bài</button>`;
  openModal(modalShell('Đăng bài lên Bảng tin','Chia sẻ thông báo hoặc tài liệu với Khát Vọng',body,footer,'modal-lg'));
  setTimeout(()=>document.getElementById('news-title')?.focus(),50);
}
async function saveNewsPost(){
  const newsEditor=document.querySelector('#news-content + .rich-editor .rich-editable');
  const newsSource=document.getElementById('news-content');
  if(newsEditor&&newsSource)newsSource.value=newsEditor.innerHTML;
  const title=document.getElementById('news-title')?.value.trim()||'';
  const content=newsSource?.value.trim()||'';
  const category=document.getElementById('news-category')?.value||'Thông báo';
  const files=[...(document.getElementById('news-files')?.files||[])];
  if(!title){showToast('Thiếu tiêu đề','Vui lòng nhập tiêu đề bài viết.','warning');return;}
  if(title.length>200){showToast('Tiêu đề quá dài','Tiêu đề tối đa 200 ký tự.','warning');return;}
  if(content.length>45000){showToast('Nội dung quá dài','Nội dung sau định dạng tối đa 45.000 ký tự; hãy rút gọn bảng hoặc nội dung.','warning');return;}
  if(files.some(f=>f.size>10*1024*1024)){showToast('Tệp quá lớn','Mỗi tệp nên nhỏ hơn 10 MB để tránh lỗi tải lên.','warning',5000);return;}
  const btn=document.querySelector('[data-action="news-save"]');
  setButtonBusy(btn,true,'Đang đăng');
  try{
    const result=await gas('createNewsPost',{title,content,category},APP.token,{timeout:60000});
    const postId=result?.id;
    if(!postId)throw new Error('Bài viết đã gửi nhưng máy chủ không trả về mã bài viết.');
    let uploaded=0;
    for(const file of files){
      const dataUrl=await newsFileToDataUrl(file);
      await gas('uploadNewsAttachment',{postId,fileName:file.name,mimeType:file.type||'application/octet-stream',fileSize:file.size,dataUrl},APP.token,{timeout:120000});
      uploaded++;
    }
    closeModal();
    showToast('Đăng bài thành công',files.length?`Đã đăng bài và tải lên ${uploaded}/${files.length} tệp.`:'Bài viết đã được đăng.','success',4000);
    await loadNewsFeed();
  }catch(err){
    showToast('Không thể đăng bài',err.message||'Đã xảy ra lỗi.','error',6000);
  }finally{
    const b=document.querySelector('[data-action="news-save"]');
    if(b)setButtonBusy(b,false);
  }
}
function newsFileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result||''));
    reader.onerror=()=>reject(new Error('Không thể đọc tệp '+file.name));
    reader.readAsDataURL(file);
  });
}
async function hideNewsPostFromFeed(postId){
  if(!postId)return;
  if(typeof openConfirm==='function'){
    // Use the app's built-in confirmation only if its API is known; otherwise use native confirmation.
  }
  if(!window.confirm('Bạn có chắc muốn ẩn bài viết này? Bài viết sẽ không còn hiển thị trên Bảng tin.'))return;
  try{
    await gas('hideNewsPost',postId,APP.token,{timeout:60000});
    showToast('Đã ẩn bài viết','Bài viết đã được ẩn khỏi Bảng tin.','success');
    await loadNewsFeed();
  }catch(err){showToast('Không thể ẩn bài viết',err.message||'Đã xảy ra lỗi.','error',5000);}
}

async function deleteNewsPostFromFeed(postId){
  if(!postId)return;
  const post=(APP.state.newsFeed||[]).find(p=>String(p.id)===String(postId));
  const title=post?.title||'bài viết này';
  const confirmed=window.confirm(
    `Bạn có chắc chắn muốn xóa "${title}" khỏi Bảng tin?\\n\\n`+
    'Bài viết sẽ không còn hiển thị với người dùng. Thao tác được ghi vào nhật ký hệ thống.'
  );
  if(!confirmed)return;

  try{
    await gas('deleteNewsPost',postId,APP.token,{timeout:60000});
    showToast('Đã xóa bài viết','Bài viết và các dữ liệu liên quan đã được xóa khỏi hệ thống.','success',4000);
    await loadNewsFeed();
  }catch(err){
    showToast('Không thể xóa bài viết',err.message||'Đã xảy ra lỗi.','error',5000);
  }
}

/* ========================= NEWS / BẢNG TIN ========================= */
function renderRules(){
  const root=document.getElementById('page-content');
  if(!root)return;
  const canPost=['Quản trị','Quản lý',].includes(APP.session?.role);
  root.innerHTML=`<div class="page-shell">
    ${pageHead('Nội quy','Quy định và nguyên tắc dành cho thành viên Khát Vọng',
      canPost?`<button class="btn btn-primary" data-action="rules-new"><span class="material-symbols-rounded">add</span>Đăng nội quy</button>`:'')}
    <div class="panel" style="padding:16px;margin-bottom:16px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <span class="material-symbols-rounded" style="color:var(--primary)">campaign</span>
        <div style="flex:1;min-width:180px"><strong>Nội quy Khát Vọng</strong><div style="color:var(--muted);font-size:12px">Cập nhật thông báo, hoạt động và tài liệu dùng chung.</div></div>
        <button class="btn btn-sm" data-action="rules-refresh"><span class="material-symbols-rounded">refresh</span>Làm mới</button>
      </div>
    </div>
    <div id="rules-feed" class="rules-feed"><div class="panel empty-state"><span class="material-symbols-rounded">progress_activity</span><strong>Đang tải Nội quy...</strong><p>Vui lòng chờ trong giây lát.</p></div></div>
  </div>`;
  loadRulesFeed();
}
async function loadRulesFeed(){
  const feed=document.getElementById('rules-feed');
  if(!feed)return;
  feed.innerHTML=`<div class="panel empty-state"><span class="material-symbols-rounded">progress_activity</span><strong>Đang tải Nội quy...</strong></div>`;
  try{
    if(APP.session?.role==='Quản trị') await gas('setupRulesModule',APP.token,{timeout:60000});
    const posts=await gas('getRulesFeed',APP.token,{timeout:60000});
    if(APP.state.page!=='rules')return;
    APP.state.rulesFeed=Array.isArray(posts)?posts:[];
    renderRulesFeed(APP.state.rulesFeed);
  }catch(err){
    if(!document.getElementById('rules-feed'))return;
    feed.innerHTML=`<div class="panel empty-state"><span class="material-symbols-rounded">error</span><strong>Không thể tải Nội quy</strong><p>${escapeHtml(err.message||'Đã xảy ra lỗi.')}</p><button class="btn btn-primary" data-action="rules-refresh">Thử lại</button></div>`;
  }
}
function renderRulesFeed(posts){
  const feed=document.getElementById('rules-feed');
  if(!feed)return;
  const allPosts=Array.isArray(posts)?posts:[];
  const categories=['Tất cả','Quy định chung','Học tập','Tác phong','Kỷ luật'];
  const current=categories.includes(APP.state.rulesCategoryTab)?APP.state.rulesCategoryTab:'Tất cả';
  APP.state.rulesCategoryTab=current;
  const counts=Object.fromEntries(categories.map(c=>[c,c==='Tất cả'?allPosts.length:allPosts.filter(p=>String(p.category||'Quy định chung').trim()===c).length]));
  const tabs=`<div class="panel" style="padding:10px;margin-bottom:14px">
    <div role="tablist" aria-label="Phân loại nội quy Nội quy" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">
      ${categories.slice(1).map(category=>`<button type="button" role="tab" aria-selected="${current===category}" data-action="rules-category-tab" data-category="${escapeAttr(category)}" class="btn ${current===category?'btn-primary':''}" style="min-width:0;justify-content:center;white-space:normal;padding:10px 8px;border-radius:10px">
        <span style="display:flex;align-items:center;justify-content:center;gap:6px;min-width:0"><span class="material-symbols-rounded" style="font-size:18px">${category==='Quy định chung'?'gavel':category==='Học tập'?'school':category==='Tác phong'?'groups':'verified_user'}</span><span>${escapeHtml(category)}</span></span>
        <span class="badge" style="margin-left:4px">${counts[category]}</span>
      </button>`).join('')}
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;font-size:12px;color:var(--muted)">
      <span>Chọn loại chia sẻ để lọc nội quy.</span>
      <button type="button" class="btn btn-sm ${current==='Tất cả'?'btn-primary':''}" data-action="rules-category-tab" data-category="Tất cả">Tất cả nội quy (${allPosts.length})</button>
    </div>
  </div>`;
  if(!allPosts.length){
    feed.innerHTML=tabs+`<div class="panel empty-state"><span class="material-symbols-rounded">campaign</span><strong>Chưa có nội quy</strong><p>Các thông báo và tài liệu được chia sẻ sẽ xuất hiện tại đây.</p></div>`;
    return;
  }
  const filtered=current==='Tất cả'?allPosts:allPosts.filter(p=>String(p.category||'Quy định chung').trim()===current);
  if(!filtered.length){
    feed.innerHTML=tabs+`<div class="panel empty-state"><span class="material-symbols-rounded">filter_list</span><strong>Chưa có nội quy thuộc mục ${escapeHtml(current)}</strong><p>Khi có nội quy loại này, nội dung sẽ xuất hiện tại đây.</p></div>`;
    return;
  }
  const role=APP.session?.role||'';
  const canMonitor=['Quản trị','Quản lý'].includes(role);
  const isAdmin=role==='Quản trị';
  feed.innerHTML=tabs+filtered.map(post=>{
    const files=Array.isArray(post.files)?post.files:[];
    const status=post.myStatus||{};
    const isNew=!status.read;
    const fileHtml=files.length?`<div style="display:grid;gap:8px;margin-top:14px">${files.map(file=>`<a class="btn" href="${escapeAttr(file.url||file.previewUrl||'#')}" target="_blank" rel="noopener noreferrer" style="justify-content:flex-start;text-decoration:none"><span class="material-symbols-rounded">${String(file.mimeType||'').startsWith('image/')?'image':'attach_file'}</span><span style="overflow-wrap:anywhere">${escapeHtml(file.name||'Tệp đính kèm')}</span><span class="material-symbols-rounded">open_in_new</span></a>`).join('')}</div>`:'';
    const date=post.createdAt?formatDateTime(post.createdAt):'';
    const summary=post.interactionSummary||{readCount:0,questionCount:0};
    return `<article class="panel" style="padding:18px;margin-bottom:14px">
      <div style="display:flex;gap:12px;align-items:flex-start">
        <div class="avatar" style="flex-shrink:0">${escapeHtml(initials(post.author||'KV'))}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><strong>${escapeHtml(post.author||'Người dùng')}</strong><span class="badge badge-blue">${escapeHtml(post.category||'Quy định chung')}</span>${isNew?'<span class="badge badge-red" style="font-weight:800;letter-spacing:.4px">NEW</span>':''}</div>
          <small style="color:var(--muted)">${escapeHtml(date)}</small>
        </div>
        ${isAdmin?`<div style="display:flex;gap:6px;align-items:center;flex-shrink:0">
          <button class="row-action" title="Ẩn nội quy" aria-label="Ẩn nội quy" data-action="rules-hide" data-id="${escapeAttr(post.id)}"><span class="material-symbols-rounded">visibility_off</span></button>
          <button class="row-action danger" title="Xóa nội quy" aria-label="Xóa nội quy" data-action="rules-delete" data-id="${escapeAttr(post.id)}"><span class="material-symbols-rounded">delete</span></button>
        </div>`:''}
      </div>
      <h2 style="font-size:18px;margin:14px 0 8px;overflow-wrap:anywhere">${escapeHtml(post.title||'')}</h2>
      <div class="rules-post-content" style="white-space:normal;overflow-wrap:anywhere;line-height:1.7">${safeRichHtml(post.content||'')}</div>
      ${fileHtml}
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
        ${status.read?`<span class="btn btn-sm" style="pointer-events:none;opacity:.8"><span class="material-symbols-rounded">check_circle</span>Đã đọc</span>`:`<button class="btn btn-sm btn-primary" data-action="rules-mark-read" data-id="${escapeAttr(post.id)}"><span class="material-symbols-rounded">mark_email_read</span>Đánh dấu đã đọc</button>`}
        <button class="btn btn-sm" data-action="rules-ask-question" data-id="${escapeAttr(post.id)}"><span class="material-symbols-rounded">help</span>Gửi thắc mắc</button>
        ${canMonitor?`<span style="font-size:12px;color:var(--muted);margin-left:auto">Đã đọc: <strong>${Number(summary.readCount)||0}</strong> · Thắc mắc: <strong>${Number(summary.questionCount)||0}</strong></span><button class="btn btn-sm" data-action="rules-monitor" data-id="${escapeAttr(post.id)}"><span class="material-symbols-rounded">analytics</span>Theo dõi</button>`:''}
      </div>
    </article>`;
  }).join('');
}
function openRulesQuestionModal(postId){
  const post=(APP.state.rulesFeed||[]).find(p=>String(p.id)===String(postId));
  if(!post)return;
  const body=`<div class="panel" style="padding:12px;margin-bottom:14px"><strong>${escapeHtml(post.title||'Quy định chung')}</strong><p style="margin:6px 0 0;color:var(--muted);font-size:13px">Thắc mắc của bạn sẽ được gắn trực tiếp với thông báo này và chỉ cấp Quản lý/Quản trị có thể theo dõi.</p></div><label class="form-field full"><span>Nội dung thắc mắc <b style="color:var(--danger)">*</b></span><textarea id="rules-question-text" class="input" rows="5" maxlength="5000" placeholder="Nhập câu hỏi hoặc nội dung cần làm rõ..."></textarea></label>`;
  const footer=`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="rules-question-save" data-id="${escapeAttr(postId)}"><span class="material-symbols-rounded">send</span>Gửi thắc mắc</button>`;
  openModal(modalShell('Gửi thắc mắc về thông báo','Thông báo: '+(post.title||''),body,footer,'modal-lg'));
}
async function saveRulesQuestion(postId){
  const reply=document.getElementById('rules-question-text')?.value.trim()||'';
  if(!reply){showToast('Chưa có nội dung','Vui lòng nhập thắc mắc trước khi gửi.','warning');return;}
  const btn=document.querySelector('[data-action="rules-question-save"]');
  setButtonBusy(btn,true,'Đang gửi');
  try{
    await gas('recordRulesQuestion',{postId,question:reply},APP.token,{timeout:60000});
    closeModal();showToast('Đã gửi thắc mắc','Thắc mắc đã được gắn với thông báo và gửi đến khu vực theo dõi của cấp quản lý.','success',4500);
    await loadRulesFeed();
  }catch(err){showToast('Không thể gửi thắc mắc',err.message||'Đã xảy ra lỗi.','error',6000);}
  finally{const b=document.querySelector('[data-action="rules-question-save"]');if(b)setButtonBusy(b,false);}
}
async function markRulesRead(postId){
  try{
    await gas('recordRulesInteraction',{postId,status:'Đã đọc'},APP.token,{timeout:60000});
    const post=(APP.state.rulesFeed||[]).find(p=>String(p.id)===String(postId));
    if(post)post.myStatus=Object.assign({},post.myStatus||{},{read:true,readAt:new Date().toISOString()});
    showToast('Đã đánh dấu đã đọc','Thông báo đã được ghi nhận là bạn đã đọc.','success',2500);
    await loadRulesFeed();
  }catch(err){showToast('Không thể cập nhật trạng thái',err.message||'Đã xảy ra lỗi.','error',5000);}
}
async function monitorRulesPost(postId){
  const role=APP.session?.role||'';
  if(!['Quản trị','Quản lý'].includes(role)){showToast('Không có quyền','Chỉ cấp Quản lý và Quản trị được theo dõi xác nhận đọc và thắc mắc.','warning');return;}
  try{
    const data=await gas('getRulesInteractionSummary',postId,APP.token,{timeout:60000});
    const readers=Array.isArray(data.readers)?data.readers:[];
    const unreadMembers=Array.isArray(data.unreadMembers)?data.unreadMembers:[];
    const questions=Array.isArray(data.questions)?data.questions:[];
    const readCount=Number(data.readCount)||readers.length;
    const memberCount=Number(data.memberCount)||readCount+unreadMembers.length;
    const readPercent=memberCount?Math.round(readCount*100/memberCount):0;
    const readersHtml=readers.length?`<div style="display:grid;gap:8px">${readers.map(x=>`<div class="panel" style="padding:10px"><strong>${escapeHtml(x.name||'Thành viên')}</strong><div style="font-size:12px;color:var(--muted)">Đã xác nhận đọc: ${escapeHtml(x.readAt||'')}</div></div>`).join('')}</div>`:'<p style="color:var(--muted)">Chưa có thành viên xác nhận đã đọc.</p>';
    const unreadHtml=unreadMembers.length?`<div style="display:grid;gap:8px">${unreadMembers.map(x=>`<div class="panel" style="padding:10px;display:flex;align-items:center;gap:10px"><span class="material-symbols-rounded" style="color:var(--warning,#d97706)">schedule</span><div style="min-width:0"><strong>${escapeHtml(x.name||'Thành viên')}</strong><div style="font-size:12px;color:var(--muted)">${escapeHtml(x.employeeId||x.username||'')}</div></div><span class="badge badge-orange" style="margin-left:auto">Chưa xác nhận</span></div>`).join('')}</div>`:'<p style="color:var(--success)">Tất cả thành viên trong phạm vi thống kê đã xác nhận đọc.</p>';
    const questionsHtml=questions.length?`<div style="display:grid;gap:10px">${questions.map(x=>`<div class="panel" style="padding:12px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><strong>${escapeHtml(x.name||'Thành viên')}</strong><small style="color:var(--muted)">${escapeHtml(x.createdAt||'')}</small></div><div style="white-space:pre-wrap;overflow-wrap:anywhere;margin-top:8px">${escapeHtml(x.question||'')}</div></div>`).join('')}</div>`:'<p style="color:var(--muted)">Chưa có thắc mắc nào cho thông báo này.</p>';
    const body=`<div class="panel" style="padding:14px;margin-bottom:14px"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px"><div><small style="color:var(--muted)">Đã xác nhận đọc</small><div style="font-size:24px;font-weight:800">${readCount} / ${memberCount}</div></div><div><small style="color:var(--muted)">Chưa xác nhận</small><div style="font-size:24px;font-weight:800">${unreadMembers.length}</div></div><div><small style="color:var(--muted)">Tỷ lệ xác nhận</small><div style="font-size:24px;font-weight:800">${readPercent}%</div></div><div><small style="color:var(--muted)">Thắc mắc liên quan</small><div style="font-size:24px;font-weight:800">${Number(data.questionCount)||questions.length}</div></div></div><div style="height:8px;background:var(--border);border-radius:99px;overflow:hidden;margin-top:12px"><div style="height:100%;width:${readPercent}%;background:var(--success,#16a34a);border-radius:99px"></div></div></div><h3 style="margin:14px 0 8px">Thành viên đã xác nhận đọc (${readCount})</h3>${readersHtml}<h3 style="margin:18px 0 8px">Thành viên chưa xác nhận (${unreadMembers.length})</h3>${unreadHtml}<h3 style="margin:18px 0 8px">Phản hồi và thắc mắc liên quan (${Number(data.questionCount)||questions.length})</h3>${questionsHtml}`;
    openModal(modalShell('Theo dõi thông báo',data.title||'Chi tiết tương tác',body,`<button class="btn btn-primary" data-action="close-modal">Đóng</button>`,'modal-lg'));
  }catch(err){showToast('Không thể tải báo cáo',err.message||'Đã xảy ra lỗi.','error',6000);}
}
function openRulesPostModal(){
  const body=`<div class="form-grid">
    <label class="form-field full"><span>Tiêu đề <b style="color:var(--danger)">*</b></span><input id="rules-title" class="input" maxlength="200" placeholder="Nhập tiêu đề nội quy"></label>
    <label class="form-field full"><span>Loại nội quy</span><select id="rules-category" class="input"><option>Quy định chung</option><option>Học tập</option><option>Tác phong</option><option>Kỷ luật</option></select></label>
    <label class="form-field full"><span>Nội dung</span><textarea id="rules-content" class="input" rows="6" maxlength="45000" placeholder="Nhập nội dung thông báo hoặc chia sẻ..."></textarea></label>
    <label class="form-field full"><span>Tệp đính kèm (không bắt buộc)</span><input id="rules-files" class="input" type="file" multiple accept="image/*,video/mp4,video/webm,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"><small style="color:var(--muted)">Tệp sẽ được tải lên sau khi nội quy được tạo. Định dạng được hỗ trợ tùy cấu hình máy chủ.</small></label>
  </div>`;
  const footer=`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="rules-save"><span class="material-symbols-rounded">send</span>Đăng nội quy</button>`;
  openModal(modalShell('Đăng nội quy lên Nội quy','Chia sẻ thông báo hoặc tài liệu với Khát Vọng',body,footer,'modal-lg'));
  setTimeout(()=>document.getElementById('rules-title')?.focus(),50);
}
async function saveRulesPost(){
  const newsEditor=document.querySelector('#rules-content + .rich-editor .rich-editable');
  const newsSource=document.getElementById('rules-content');
  if(newsEditor&&newsSource)newsSource.value=newsEditor.innerHTML;
  const title=document.getElementById('rules-title')?.value.trim()||'';
  const content=newsSource?.value.trim()||'';
  const category=document.getElementById('rules-category')?.value||'Quy định chung';
  const files=[...(document.getElementById('rules-files')?.files||[])];
  if(!title){showToast('Thiếu tiêu đề','Vui lòng nhập tiêu đề nội quy.','warning');return;}
  if(title.length>200){showToast('Tiêu đề quá dài','Tiêu đề tối đa 200 ký tự.','warning');return;}
  if(content.length>45000){showToast('Nội dung quá dài','Nội dung sau định dạng tối đa 45.000 ký tự; hãy rút gọn bảng hoặc nội dung.','warning');return;}
  if(files.some(f=>f.size>10*1024*1024)){showToast('Tệp quá lớn','Mỗi tệp nên nhỏ hơn 10 MB để tránh lỗi tải lên.','warning',5000);return;}
  const btn=document.querySelector('[data-action="rules-save"]');
  setButtonBusy(btn,true,'Đang đăng');
  try{
    const result=await gas('createRulesPost',{title,content,category},APP.token,{timeout:60000});
    const postId=result?.id;
    if(!postId)throw new Error('Bài viết đã gửi nhưng máy chủ không trả về mã nội quy.');
    let uploaded=0;
    for(const file of files){
      const dataUrl=await rulesFileToDataUrl(file);
      await gas('uploadRulesAttachment',{postId,fileName:file.name,mimeType:file.type||'application/octet-stream',fileSize:file.size,dataUrl},APP.token,{timeout:120000});
      uploaded++;
    }
    closeModal();
    showToast('Đăng nội quy thành công',files.length?`Đã đăng bài và tải lên ${uploaded}/${files.length} tệp.`:'Bài viết đã được đăng.','success',4000);
    await loadRulesFeed();
  }catch(err){
    showToast('Không thể đăng bài',err.message||'Đã xảy ra lỗi.','error',6000);
  }finally{
    const b=document.querySelector('[data-action="rules-save"]');
    if(b)setButtonBusy(b,false);
  }
}
function rulesFileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result||''));
    reader.onerror=()=>reject(new Error('Không thể đọc tệp '+file.name));
    reader.readAsDataURL(file);
  });
}
async function hideRulesPostFromFeed(postId){
  if(!postId)return;
  if(typeof openConfirm==='function'){
    // Use the app's built-in confirmation only if its API is known; otherwise use native confirmation.
  }
  if(!window.confirm('Bạn có chắc muốn ẩn nội quy này? Bài viết sẽ không còn hiển thị trên Nội quy.'))return;
  try{
    await gas('hideRulesPost',postId,APP.token,{timeout:60000});
    showToast('Đã ẩn nội quy','Bài viết đã được ẩn khỏi Nội quy.','success');
    await loadRulesFeed();
  }catch(err){showToast('Không thể ẩn nội quy',err.message||'Đã xảy ra lỗi.','error',5000);}
}

async function deleteRulesPostFromFeed(postId){
  if(!postId)return;
  const post=(APP.state.rulesFeed||[]).find(p=>String(p.id)===String(postId));
  const title=post?.title||'nội quy này';
  const confirmed=window.confirm(
    `Bạn có chắc chắn muốn xóa "${title}" khỏi Nội quy?\\n\\n`+
    'Bài viết sẽ không còn hiển thị với người dùng. Thao tác được ghi vào nhật ký hệ thống.'
  );
  if(!confirmed)return;

  try{
    await gas('deleteRulesPost',postId,APP.token,{timeout:60000});
    showToast('Đã xóa nội quy','Bài viết đã được gỡ khỏi Nội quy.','success',4000);
    await loadRulesFeed();
  }catch(err){
    showToast('Không thể xóa nội quy',err.message||'Đã xảy ra lỗi.','error',5000);
  }
}


/* ========================= PHẢN TƯ ========================= */
function renderReflection(){
  const root=document.getElementById('page-content'); if(!root)return;
  root.innerHTML=`<div class="page-shell reflection-page">
    ${pageHead('Phản tư','Ghi lại suy nghĩ, bài học kinh nghiệm và những thay đổi trên hành trình trưởng thành.',`<button class="btn btn-primary" data-action="reflection-new"><span class="material-symbols-rounded">add</span>Viết phản tư</button>`)}
    <div class="reflection-toolbar panel"><div class="reflection-toolbar-icon"><span class="material-symbols-rounded">psychology</span></div><div class="reflection-toolbar-copy"><strong>Không gian phản tư Khát Vọng</strong><span>Mỗi chia sẻ là một dấu mốc để nhìn lại, thấu hiểu và phát triển bản thân.</span></div><button class="btn btn-sm" data-action="reflection-refresh"><span class="material-symbols-rounded">refresh</span>Làm mới</button></div>
    <div id="reflection-board" class="reflection-board"><div class="panel empty-state"><span class="material-symbols-rounded">progress_activity</span><strong>Đang tải bài phản tư...</strong></div></div>
  </div>`;
  loadReflectionFeed();
}
async function loadReflectionFeed(){
  const board=document.getElementById('reflection-board');if(!board)return;
  board.innerHTML=`<div class="panel empty-state"><span class="material-symbols-rounded">progress_activity</span><strong>Đang tải bài phản tư...</strong></div>`;
  try{const posts=await gas('getReflectionFeed',APP.token,{timeout:60000});if(APP.state.page!=='reflection')return;APP.state.reflectionFeed=Array.isArray(posts)?posts:[];renderReflectionFeed(APP.state.reflectionFeed);}
  catch(err){if(!document.getElementById('reflection-board'))return;board.innerHTML=`<div class="panel empty-state"><span class="material-symbols-rounded">error</span><strong>Không thể tải Phản tư</strong><p>${escapeHtml(err.message||'Đã xảy ra lỗi.')}</p><button class="btn btn-primary" data-action="reflection-refresh">Thử lại</button></div>`;}
}
function renderReflectionFeed(posts){
  const board=document.getElementById('reflection-board');if(!board)return;
  const columns=['Mục 1','Mục 2','Mục 3','Mục 4'];
  const hints={
    'Mục 1':'Suy nghĩ, cảm xúc và điều đang diễn ra',
    'Mục 2':'Bài học, nhận thức và kinh nghiệm',
    'Mục 3':'Mục tiêu, thay đổi và điều muốn cải thiện',
    'Mục 4':'Dấu mốc, trưởng thành và điều biết ơn'
  };
  const items=Array.isArray(posts)?posts:[];
  const isAdmin=APP.session?.role==='Quản trị';
  board.innerHTML=columns.map((col,i)=>{
    const rows=items.filter(p=>(p.column||'Mục 1')===col);
    const cards=rows.map(p=>{
      const created=p.createdAt?formatDateTime(p.createdAt):'Chưa có thời gian';
      // safeRichHtml giữ lại định dạng văn bản được hỗ trợ bởi trình soạn thảo,
      // đồng thời lọc HTML không an toàn trước khi hiển thị.
      const content=safeRichHtml(String(p.content||'').replace(/\n/g,'<br>'));
      return `<article class="reflection-card">
        <div class="reflection-card-top">
          <span class="reflection-card-dot dot-${i+1}"></span>
          <span class="reflection-card-category">${escapeHtml(col)}</span>
          <small>${escapeHtml(p.session||'Chưa phân buổi')} · ${escapeHtml(created)}</small>
          ${(String(p.userId)===String(APP.session?.userId)||isAdmin)?`<button class="btn btn-sm" data-action="reflection-edit" data-id="${escapeAttr(p.id)}" data-column="${escapeAttr(col)}"><span class="material-symbols-rounded">edit</span>Sửa</button>`:''}
          ${isAdmin?`<button class="reflection-card-delete" title="Xóa bài phản tư" aria-label="Xóa bài phản tư" data-action="reflection-delete" data-id="${escapeAttr(p.id)}"><span class="material-symbols-rounded">delete</span></button>`:''}
        </div>
        <h3>${escapeHtml(p.title||'Phản tư chưa đặt chủ đề')}</h3>
        <div class="reflection-card-content">${content||'<p class="reflection-no-content">Chưa có nội dung.</p>'}</div>
        <footer>
          ${p.employeeId?avatarHtml(p.employeeId,28):`<span class="avatar reflection-avatar" title="${escapeAttr(p.author||'Thành viên Khát Vọng')}">${escapeHtml(initials(p.author||'KV'))}</span>`}
          <span class="reflection-author">${escapeHtml(p.author||'Thành viên Khát Vọng')}</span>
          <span class="reflection-card-meta">${escapeHtml(p.session||'Bài phản tư')}</span>
        </footer>
      </article>`;
    }).join('');
    return `<section class="reflection-column">
      <header class="reflection-column-head">
        <div><strong>${escapeHtml(col)}</strong><small>${escapeHtml(hints[col])}</small></div>
        <span class="reflection-count" aria-label="${rows.length} bài">${rows.length}</span>
      </header>
      <div class="reflection-column-posts">
        ${cards||`<div class="reflection-column-empty"><span class="material-symbols-rounded">edit_note</span><strong>Chưa có bài viết</strong><span>Bài phản tư mới trong mục này sẽ hiển thị tại đây.</span></div>`}
        <button class="reflection-add-card" data-action="reflection-new" data-column="${escapeAttr(col)}"><span class="material-symbols-rounded">add</span>Viết trong mục này</button>
      </div>
    </section>`;
  }).join('');
  if(!items.length)board.insertAdjacentHTML('beforeend','<div class="reflection-empty-note"><span class="material-symbols-rounded">psychology</span><strong>Chưa có bài phản tư nào</strong><span>Hãy bắt đầu bằng một suy nghĩ nhỏ của bạn. Bài viết sẽ được lưu thành một hàng dữ liệu trong trang tính “Phản tư” và hiển thị tại đúng mục đã chọn.</span></div>');
}
function openReflectionComposer(column='Mục 1',postId=''){
  const existing=(APP.state.reflectionFeed||[]).find(p=>String(p.id)===String(postId))||null;
  const esc=v=>escapeHtml(String(v||''));
  const body=`<div class="reflection-composer-form">
    <div class="reflection-composer-intro">
      <span class="material-symbols-rounded">edit_note</span>
      <div><strong>Viết để nhìn lại và trưởng thành</strong><small>Nội dung được lưu vào hệ thống sau khi bạn chọn “Đăng bài”.</small></div>
    </div>
    <label class="reflection-form-label" for="reflection-session">Buổi phản tư <b>*</b></label>
    <input id="reflection-session" class="reflection-title-input" maxlength="120" list="reflection-session-options" value="${esc(existing?.session)}" placeholder="Ví dụ: Buổi 01 – Khám phá bản thân">
    <datalist id="reflection-session-options">${[...new Set((APP.state.reflectionFeed||[]).map(p=>p.session).filter(Boolean))].map(x=>`<option value="${escapeAttr(x)}"></option>`).join('')}</datalist>
    <label class="reflection-form-label" for="reflection-prompt">Yêu cầu phản tư của buổi</label>
    <textarea id="reflection-prompt" class="reflection-content-input" rows="3" placeholder="Nêu câu hỏi hoặc yêu cầu cần phản tư...">${esc(existing?.prompt)}</textarea>
    <label class="reflection-form-label" for="reflection-title">Chủ đề bài phản tư <b>*</b></label>
    <input id="reflection-title" class="reflection-title-input" maxlength="200" value="${esc(existing?.title)}" placeholder="Ví dụ: Điều em học được từ hoạt động vừa qua" aria-label="Chủ đề bài phản tư">
    <label class="reflection-form-label" for="reflection-content">Nội dung phản tư <b>*</b></label>
    <textarea id="reflection-content" class="reflection-content-input" maxlength="45000" rows="12" placeholder="Viết suy nghĩ, cảm xúc, bài học, điều bạn muốn thay đổi hoặc kế hoạch hành động...">${existing?.content||''}</textarea>
    <div class="reflection-editor-help"><span class="material-symbols-rounded">format_size</span> Có thể định dạng chữ, tiêu đề, danh sách, căn lề, màu chữ và bảng bằng thanh công cụ soạn thảo.</div>
    <label class="reflection-column-select"><span>Phân loại bài viết</span><select id="reflection-column" class="input">${['Mục 1','Mục 2','Mục 3','Mục 4'].map(c=>`<option value="${escapeAttr(c)}" ${c===column?'selected':''}>${escapeHtml(c)} — ${escapeHtml(({ 'Mục 1':'Suy nghĩ & cảm xúc','Mục 2':'Bài học kinh nghiệm','Mục 3':'Điều muốn cải thiện','Mục 4':'Hành trình trưởng thành' })[c])}</option>`).join('')}</select></label>
    <div class="reflection-save-note"><span class="material-symbols-rounded">cloud_done</span><span>Bài viết được lưu theo từng dòng dữ liệu, với chủ đề, nội dung, mục hiển thị, người đăng, thời gian và trạng thái ở các cột riêng biệt.</span></div>
  </div>`;
  const footer=`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="reflection-save" data-id="${escapeAttr(existing?.id||'')}"><span class="material-symbols-rounded">save</span>${existing?'Lưu chỉnh sửa':'Đăng bài phản tư'}</button>`;
  openModal(modalShell(existing?'Chỉnh sửa bài phản tư':'Tạo bài phản tư','Mỗi học sinh chỉ có một bài cho mỗi buổi; có thể mở lại để chỉnh sửa.',body,footer,'reflection-composer-modal'));
  setTimeout(()=>document.getElementById('reflection-title')?.focus(),50);
}
async function saveReflectionPost(){
  const title=document.getElementById('reflection-title')?.value.trim()||'';
  const session=document.getElementById('reflection-session')?.value.trim()||'';
  const prompt=document.getElementById('reflection-prompt')?.value.trim()||'';
  const source=document.getElementById('reflection-content');
  const editor=source?.nextElementSibling?.classList.contains('rich-editor')?source.nextElementSibling.querySelector('.rich-editable'):document.querySelector('#reflection-content + .rich-editor .rich-editable');
  if(editor&&source)source.value=editor.innerHTML;
  const content=String(source?.value||'').trim();
  const column=document.getElementById('reflection-column')?.value||'Mục 1';
  if(!session){showToast('Thiếu buổi phản tư','Vui lòng nhập tên buổi để hệ thống kiểm soát trùng lặp.','warning');document.getElementById('reflection-session')?.focus();return;}
  if(!title){showToast('Thiếu chủ đề','Vui lòng nhập chủ đề cho bài phản tư.','warning');document.getElementById('reflection-title')?.focus();return;}
  if(!content||content==='<br>'||content==='<div><br></div>'){showToast('Chưa có nội dung','Hãy viết nội dung phản tư trước khi đăng.','warning');editor?.focus();return;}
  if(title.length>200){showToast('Chủ đề quá dài','Chủ đề tối đa 200 ký tự.','warning');return;}
  if(content.length>45000){showToast('Nội dung quá dài','Nội dung sau định dạng tối đa 45.000 ký tự. Vui lòng rút gọn bài viết.','warning');return;}
  const btn=document.querySelector('[data-action="reflection-save"]');setButtonBusy(btn,true,'Đang lưu');
  try{
    const id=btn?.dataset.id||'';
    if(id) await gas('updateReflectionPost',{id,title,content,column,session,prompt},APP.token,{timeout:60000});
    else await gas('createReflectionPost',{title,content,column,session,prompt},APP.token,{timeout:60000});
    closeModal();
    showToast('Đã lưu bài phản tư',id?'Nội dung chỉnh sửa đã được cập nhật.':'Bài đã lưu cho buổi học này.','success',4000);
    await loadReflectionFeed();
  }catch(err){showToast('Không thể đăng bài phản tư',err.message||'Đã xảy ra lỗi.','error',6000);}
  finally{const b=document.querySelector('[data-action="reflection-save"]');if(b)setButtonBusy(b,false);}
}
async function deleteReflectionPost(id){
  if(!id||APP.session?.role!=='Quản trị')return;
  if(!window.confirm('Bạn có chắc muốn xóa vĩnh viễn bài phản tư này? Dữ liệu sẽ bị xóa khỏi hệ thống và không thể khôi phục.'))return;
  try{await gas('deleteReflectionPost',id,APP.token,{timeout:60000});showToast('Đã xóa bài phản tư','Bài viết đã được gỡ khỏi bảng.','success');await loadReflectionFeed();}
  catch(err){showToast('Không thể xóa bài',err.message||'Đã xảy ra lỗi.','error');}
}

/* ========================= PAGE ROUTER ========================= */
function changePage(page,initial=false){
  if(APP.state.page==='attendance' && page!=='attendance' && typeof stopAttendancePolling==='function') stopAttendancePolling();
  if(!PAGE_META[page]) page='dashboard';
  if(!canAccessPageByRole(page)){
    if(!initial)showToast('Không có quyền truy cập','Chức năng này không thuộc phạm vi vai trò của tài khoản hiện tại.','warning',4200);
    page='dashboard';
  }
  APP.state.page=page;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  const meta=PAGE_META[page];setText('topbar-title',meta[0]);setText('topbar-subtitle',meta[1]);
  const icon=document.querySelector('.topbar-section-icon span');if(icon)icon.textContent=meta[2];
  syncTopQuickFlowButton(page);
  syncDashboardPdfButton(page);
  if(window.innerWidth<=1050) closeSidebarMobile();
  renderCurrentPage();
  if(['kpi-month','kpi-evaluation'].includes(page)) refreshKpiOnPageEntry(page);
  if(!initial) window.scrollTo({top:0,behavior:'smooth'});
}
function renderCurrentPage(){
  const renderers={dashboard:renderDashboard,'action-center':renderActionCenter,projects:renderProjects,tasks:renderTasks,kanban:renderKanban,gantt:renderGantt,calendar:renderCalendar,'schedule-polls':renderSchedulePolls,reminders:renderReminders,'kpi-month':renderKpiMonth,'kpi-templates':renderKpiTemplates,'kpi-evaluation':renderKpiEvaluation,'kpi-finalize':renderKpiFinalize,employees:renderEmployees,categories:renderCategories,files:renderFiles,reports:renderReports,audit:renderAudit,users:renderUsers,news: renderNews,reflection:renderReflection,rules:renderRules,teams:renderTeams,attendance:renderAttendance,'learning-grades':renderLearningGrades,help:renderHelp};
  safeRender(APP.state.page,renderers[APP.state.page]||renderDashboard);
}
function safeRender(name,fn){
  try{ destroyUnusedCharts(name); fn(); updateActionCounts(); requestAnimationFrame(()=>{applyPermissions();if(typeof initLazyEmployeeAvatars==='function')initLazyEmployeeAvatars(document.getElementById('page-content'));if(typeof syncSelectAllCheckboxes==='function')syncSelectAllCheckboxes();}); }
  catch(err){console.error('Render '+name,err);document.getElementById('page-content').innerHTML=`<div class="page-shell"><div class="panel empty-state"><span class="material-symbols-rounded">error</span><strong>Không thể hiển thị nội dung</strong><p>${escapeHtml(err.message)}</p><button class="btn btn-primary" data-action="refresh-data">Làm mới dữ liệu</button></div></div>`;showToast('Không thể hiển thị '+(PAGE_META[name]?.[0]||name),err.message,'error');}
}
function pageHead(title,subtitle,actions=''){return `<div class="page-head"><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div><div class="page-actions">${actions}</div></div>`;}

/* ========================= PERIOD ========================= */
function initPeriod(key){
  const now=new Date();let from,to,label;
  if(key==='last-month'){const d=new Date(now.getFullYear(),now.getMonth()-1,1);from=startOfMonth(d);to=endOfMonth(d);label='Tháng trước';}
  else if(key==='this-quarter'){from=startOfQuarter(now);to=endOfQuarter(now);label='Quý này';}
  else if(key==='last-quarter'){const d=new Date(now.getFullYear(),now.getMonth()-3,1);from=startOfQuarter(d);to=endOfQuarter(d);label='Quý trước';}
  else if(key==='this-year'){from=new Date(now.getFullYear(),0,1);to=new Date(now.getFullYear(),11,31,23,59,59);label='Năm nay';}
  else{from=startOfMonth(now);to=endOfMonth(now);label='Tháng này';key='this-month';}
  APP.state.period={key,label,from,to};updatePeriodLabel();
}
function updatePeriodLabel(){setText('period-label',APP.state.period.label||'Tháng này');}
function taskRangeOverlapsPeriod(task,from,to){
  if(!task)return false;
  let start=parseDate(task['Ngày bắt đầu']);
  let end=parseDate(task['Hạn hoàn thành']);
  if(!start&&!end)return true;
  if(!start)start=end;
  if(!end)end=start;
  if(end<start){const tmp=start;start=end;end=tmp;}
  const rangeFrom=from?startOfDay(from):null;
  const rangeTo=to?endOfDay(to):null;
  return (!rangeTo||start<=rangeTo)&&(!rangeFrom||end>=rangeFrom);
}
function periodFilter(rows,dateField){
  const {from,to}=APP.state.period;
  return (rows||[]).filter(r=>{
    // Công việc được xem là thuộc kỳ nếu khoảng [Ngày bắt đầu, Hạn hoàn thành]
    // giao với kỳ đang xem. Ví dụ 26/08 -> 02/09 phải xuất hiện ở cả tháng 8 và tháng 9.
    if(dateField==='Hạn hoàn thành' && r && ('Ngày bắt đầu' in r || 'Hạn hoàn thành' in r)){
      return taskRangeOverlapsPeriod(r,from,to);
    }
    const d=parseDate(r?.[dateField]);
    return !d || ((!from||d>=from)&&(!to||d<=to));
  });
}

/* ========================= DASHBOARD ========================= */
function renderDashboard(){
  const tasks=periodFilter(APP.data.tasks||[],'Hạn hoàn thành');
  const projects=APP.data.projects||[]; const kpis=periodFilter(APP.data.kpiMonths||[],'Kỳ').filter(k=>['Đã đánh giá','Đã chốt'].includes(k['Trạng thái KPI']));
  const done=tasks.filter(t=>t['Trạng thái']==='Hoàn thành'); const overdue=tasks.filter(isTaskOverdue); const waiting=tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận');
  const completion=tasks.length?round1(done.length*100/tasks.length):0; const avgKpi=kpis.length?round1(kpis.reduce((s,k)=>s+Number(k['Tổng điểm KPI']||0),0)/kpis.length):0;
  const exceed=kpis.filter(k=>Number(k['Tổng điểm KPI']||0)>100).length; const projectAttention=projects.filter(p=>p['Trạng thái']==='Đang thực hiện' && (isProjectLate(p)||Number(p['Tiến độ (%)']||0)<35)).length;
  const tabs=`<div class="panel dashboard-tabs"><button class="${APP.state.dashboardTab==='overview'?'active':''}" data-action="tab-switch" data-group="dashboardTab" data-value="overview"><span class="material-symbols-rounded">dashboard</span>Tổng quan</button><button class="${APP.state.dashboardTab==='tasks'?'active':''}" data-action="tab-switch" data-group="dashboardTab" data-value="tasks"><span class="material-symbols-rounded">checklist</span>Báo cáo công việc</button><button class="${APP.state.dashboardTab==='kpi'?'active':''}" data-action="tab-switch" data-group="dashboardTab" data-value="kpi"><span class="material-symbols-rounded">speed</span>Báo cáo KPI</button></div>`;
  if(APP.state.dashboardTab==='tasks'){return renderDashboardTasks(tabs,tasks);}
  if(APP.state.dashboardTab==='kpi'){return renderDashboardKpi(tabs,kpis);}
  const html=`<div class="page-shell">${tabs}
    <div class="kpi-grid">
      ${kpiCard('Tổng công việc',tasks.length,'task_alt','blue','01','Mới so với kỳ đang xem')}
      ${kpiCard('Tỷ lệ hoàn thành',completion+'%','check_circle','green','02',`${done.length} công việc hoàn thành`)}
      ${kpiCard('Quá hạn',overdue.length,'schedule','red','03',overdue.length?'Cần ưu tiên xử lý':'Không có việc quá hạn')}
      ${kpiCard('Chờ xác nhận',waiting.length,'hourglass_top','orange','04',waiting.length?'Quản lý cần kiểm tra':'Đã xử lý hết')}
      ${kpiCard('KPI trung bình',avgKpi+'%','target','violet','05',kpis.length?`${kpis.length} hồ sơ KPI`:'Chưa có KPI kỳ này')}
      ${kpiCard('Nhân sự vượt KPI',exceed,'person_celebrate','green','06',exceed?'Trên 100 điểm':'Chưa ghi nhận')}
      ${kpiCard('Dự án cần chú ý',projectAttention,'warning','orange','07','Theo tiến độ và thời hạn')}
      ${kpiCard('Dự án đang chạy',projects.filter(p=>p['Trạng thái']==='Đang thực hiện').length,'folder_open','blue','08','Toàn bộ dự án đang thực hiện')}
    </div>
    <div class="dashboard-grid">
      <div class="panel chart-card"><div class="section-title-row"><h2>Xu hướng KPI trung bình theo tháng</h2><small>6 tháng gần nhất</small></div><div class="chart-wrap"><canvas id="chart-kpi-trend"></canvas></div></div>
      <div class="panel chart-card"><div class="section-title-row"><h2>Tiến độ công việc theo Nhóm</h2><small>Kỳ đang xem</small></div><div class="chart-wrap"><canvas id="chart-department-progress"></canvas></div></div>
      <div class="panel chart-card"><div class="section-title-row"><h2>Tình trạng công việc</h2><small>${tasks.length} công việc</small></div><div class="chart-wrap"><canvas id="chart-task-status"></canvas></div></div>
    </div>
    <div class="ops-grid">
      <div class="panel ops-card"><div class="section-title-row"><h2>Công việc cần xử lý</h2><span class="badge badge-red">${overdue.length+waiting.length}</span></div>${renderMiniTaskTable([...overdue,...waiting].slice(0,7))}<button class="btn btn-sm" data-page="action-center">Xem tất cả việc cần xử lý <span class="material-symbols-rounded">arrow_forward</span></button></div>
      <div class="panel ops-card"><div class="section-title-row"><h2>Cảnh báo vận hành</h2></div>${renderDashboardAlerts(tasks,projects,kpis)}</div>
      <div class="panel ops-card"><div class="section-title-row"><h2>Nhân sự vượt KPI</h2><button class="btn btn-sm" data-page="kpi-month">Xem KPI</button></div>${renderKpiRanking(kpis.filter(k=>Number(k['Tổng điểm KPI']||0)>=90).sort((a,b)=>Number(b['Tổng điểm KPI'])-Number(a['Tổng điểm KPI'])).slice(0,6))}</div>
    </div>
  </div>`;
  document.getElementById('page-content').innerHTML=html;
  requestAnimationFrame(()=>renderDashboardCharts(tasks,kpis));
}
function kpiCard(label,value,icon,color,index,note){return `<div class="panel kpi-card"><span class="kpi-stripe" style="background:var(--${color==='blue'?'blue':color})"></span><div class="kpi-main"><div class="kpi-icon ${color}"><span class="material-symbols-rounded">${icon}</span></div><div><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-trend ${color==='red'?'text-danger':'text-success'}"><span class="material-symbols-rounded" style="font-size:13px">${color==='red'?'trending_up':'monitoring'}</span>${escapeHtml(note)}</div></div></div><span class="kpi-index">${index}</span></div>`;}
function renderDashboardTasks(tabs,tasks){
  const byStatus=countBy(tasks,'Trạng thái'); const byPriority=countBy(tasks,'Mức độ ưu tiên');
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${tabs}${pageHead('Báo cáo công việc','Phân tích tình trạng, ưu tiên và hiệu suất hoàn thành theo kỳ đang xem','')}<div class="dashboard-grid"><div class="panel chart-card"><div class="section-title-row"><h2>Công việc theo trạng thái</h2></div><div class="chart-wrap"><canvas id="dash-task-status"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Công việc theo ưu tiên</h2></div><div class="chart-wrap"><canvas id="dash-task-priority"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Tỷ lệ đúng hạn</h2></div><div class="empty-state" style="min-height:245px"><strong style="font-size:34px">${taskOnTimeRate(tasks)}%</strong><p>Tỷ lệ công việc hoàn thành đúng hoặc trước hạn trong kỳ.</p></div></div></div><div class="panel table-panel">${renderTasksTable(tasks.slice(0,20),'dashboardTasks',false)}</div></div>`;
  requestAnimationFrame(()=>{createChart('dash-task-status','doughnut',Object.keys(byStatus),Object.values(byStatus));createChart('dash-task-priority','bar',Object.keys(byPriority),Object.values(byPriority));});
}
function renderDashboardKpi(tabs,kpis){
  const employeeMap=employeeNameMap();
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${tabs}${pageHead('Báo cáo KPI','Theo dõi điểm KPI, xếp loại và nhân sự cần đánh giá','')}<div class="dashboard-grid"><div class="panel chart-card"><div class="section-title-row"><h2>Điểm KPI theo nhân sự</h2></div><div class="chart-wrap chart-wrap-kpi-people"><canvas id="dash-kpi-people"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Phân loại KPI</h2></div><div class="chart-wrap"><canvas id="dash-kpi-class"></canvas></div></div><div class="panel ops-card"><div class="section-title-row"><h2>Xếp hạng KPI</h2></div>${renderKpiRanking([...kpis].sort((a,b)=>Number(b['Tổng điểm KPI'])-Number(a['Tổng điểm KPI'])).slice(0,8))}</div></div></div>`;
  requestAnimationFrame(()=>{renderKpiPeopleChart('dash-kpi-people',kpis,employeeMap,{maxItems:10,suffix:' điểm'});const c=countBy(kpis,'Xếp loại');createChart('dash-kpi-class','doughnut',Object.keys(c),Object.values(c));});
}
function renderDashboardCharts(tasks,kpis){
  const trend=lastMonths(6).map(m=>{const rows=(APP.data.kpiMonths||[]).filter(k=>sameMonth(parseDate(k['Kỳ']),m)&&['Đã đánh giá','Đã chốt'].includes(k['Trạng thái KPI']));return rows.length?round1(rows.reduce((s,k)=>s+Number(k['Tổng điểm KPI']||0),0)/rows.length):0;});
  createChart('chart-kpi-trend','line',lastMonths(6).map(formatPeriod),trend,{max:120});
  const dep={};tasks.forEach(t=>{const emp=findEmployee(t['Mã người phụ trách']);const key=emp?.['Nhóm']||'Khác';if(!dep[key])dep[key]={sum:0,n:0};dep[key].sum+=Number(t['Tiến độ (%)']||0);dep[key].n++;});createChart('chart-department-progress','bar',Object.keys(dep),Object.values(dep).map(x=>round1(x.sum/x.n)),{max:100});
  const status=countBy(tasks,'Trạng thái');createChart('chart-task-status','doughnut',Object.keys(status),Object.values(status));
}
function renderMiniTaskTable(tasks){if(!tasks.length)return emptyState('task_alt','Không có công việc cần xử lý','Các công việc cần chú ý sẽ hiển thị tại đây.');return `<table class="mini-table"><thead><tr><th>Mã việc</th><th>Tên công việc</th><th>Người phụ trách</th><th>Hạn</th><th>Trạng thái</th><th></th></tr></thead><tbody>${tasks.map(t=>`<tr><td class="text-primary">${escapeHtml(t['Mã công việc'])}</td><td class="task-main"><strong>${escapeHtml(t['Tên công việc'])}</strong><small>${escapeHtml(projectName(t['Mã dự án']))}</small></td><td>${personInline(t['Mã người phụ trách'])}</td><td>${formatDate(t['Hạn hoàn thành'])}</td><td>${statusBadge(isTaskOverdue(t)?'Quá hạn':t['Trạng thái'])}</td><td><button class="row-action" data-action="view-task" data-id="${t['Mã công việc']}"><span class="material-symbols-rounded">open_in_new</span></button></td></tr>`).join('')}</tbody></table>`;}
function renderDashboardAlerts(tasks,projects,kpis){
  const overdue=tasks.filter(isTaskOverdue).length,near=tasks.filter(isTaskNearDue).length,waiting=tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận').length,stale=tasks.filter(t=>t['Trạng thái']==='Đang thực hiện'&&Number(t['Tiến độ (%)']||0)<20).length,projectLate=projects.filter(isProjectLate).length;
  const arr=[['Công việc quá hạn',overdue,'red','schedule'],['Sắp đến hạn trong 7 ngày',near,'orange','warning'],['Dự án có nguy cơ trễ',projectLate,'orange','folder_open'],['Chờ xác nhận',waiting,'blue','hourglass_top'],['Chưa cập nhật tiến độ',stale,'blue','update']];return arr.map(([l,c,color,ic])=>`<div class="alert-row"><div class="alert-icon ${color}"><span class="material-symbols-rounded">${ic}</span></div><div class="alert-copy"><strong>${l}</strong><small>${c?c+' mục cần xử lý':'Không có cảnh báo'}</small></div><div class="alert-count">${c}</div><span class="material-symbols-rounded" style="font-size:16px;color:var(--muted)">chevron_right</span></div>`).join('');
}
function renderKpiRanking(kpis){if(!kpis.length)return emptyState('speed','Chưa có dữ liệu KPI','KPI của kỳ đang xem sẽ hiển thị tại đây.');return `<div class="rank-list">${kpis.map((k,i)=>`<div class="rank-row"><span class="rank-number">${i+1}</span>${avatarHtml(k['Mã nhân sự'],28)}<div><strong style="font-size:11.5px">${escapeHtml(employeeName(k['Mã nhân sự']))}</strong><small style="display:block;color:var(--muted);font-size:9.5px">${escapeHtml(findEmployee(k['Mã nhân sự'])?.['Nhóm']||'')}</small></div><div class="rank-line"><span style="width:${Math.min(100,Number(k['Tổng điểm KPI']||0)/1.2)}%"></span></div><strong class="text-success">${round1(k['Tổng điểm KPI']||0)}%</strong></div>`).join('')}</div>`;}
function renderActionCenter(){
  const tasks=APP.data.tasks||[],kpis=APP.data.kpiMonths||[];const overdue=tasks.filter(isTaskOverdue),waiting=tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận'),near=tasks.filter(isTaskNearDue),kpiPending=kpis.filter(k=>['Chờ quản lý duyệt','Đã đánh giá'].includes(k['Trạng thái KPI']));
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Việc cần xử lý','Ưu tiên các công việc và KPI cần hành động trong thời gian gần nhất')}<div class="action-columns"><div class="panel action-section"><div class="section-title-row"><h2>Công việc quá hạn</h2><span class="badge badge-red">${overdue.length}</span></div>${renderActionCards(overdue,'red')}</div><div class="panel action-section"><div class="section-title-row"><h2>Chờ quản lý xác nhận</h2><span class="badge badge-orange">${waiting.length}</span></div>${renderActionCards(waiting,'orange')}</div><div class="panel action-section"><div class="section-title-row"><h2>Sắp đến hạn</h2><span class="badge badge-orange">${near.length}</span></div>${renderActionCards(near,'blue')}</div><div class="panel action-section"><div class="section-title-row"><h2>KPI cần xử lý</h2><span class="badge badge-violet">${kpiPending.length}</span></div>${kpiPending.length?kpiPending.slice(0,10).map(k=>`<div class="action-card blue"><div class="action-card-icon"><span class="material-symbols-rounded">speed</span></div><div><strong>${escapeHtml(employeeName(k['Mã nhân sự']))} - ${formatPeriod(k['Kỳ'])}</strong><p>${escapeHtml(k['Trạng thái KPI'])} · ${round1(k['Tổng điểm KPI']||0)} điểm</p></div><button class="row-action" data-action="${k['Trạng thái KPI']==='Đã đánh giá'?'finalize-kpi':'evaluate-kpi'}" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">arrow_forward</span></button></div>`).join(''):emptyState('done_all','Không có KPI cần xử lý','Các KPI chờ đánh giá hoặc chốt sẽ xuất hiện tại đây.')}</div></div></div>`;
}
function renderActionCards(tasks,color){if(!tasks.length)return emptyState('done_all','Không có dữ liệu cần xử lý','Danh sách này hiện đang trống.');return tasks.slice(0,10).map(t=>`<div class="action-card ${color}"><div class="action-card-icon"><span class="material-symbols-rounded">${color==='red'?'schedule':'task_alt'}</span></div><div><strong>${escapeHtml(t['Tên công việc'])}</strong><p>${escapeHtml(employeeName(t['Mã người phụ trách']))} · Hạn ${formatDate(t['Hạn hoàn thành'])}</p></div><button class="row-action" data-action="${t['Trạng thái']==='Chờ xác nhận'&&APP.permissions.canConfirmTask?'confirm-task':'view-task'}" data-id="${t['Mã công việc']}"><span class="material-symbols-rounded">arrow_forward</span></button></div>`).join('');}

/* ========================= PROJECTS ========================= */
function renderProjects(){
  const module='projects';let rows=applySearchFilter(module,APP.data.projects||[],['Mã dự án','Tên dự án','Loại dự án','Mã người phụ trách','Trạng thái']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Ngày tạo');
  const actions=[APP.permissions.canManageProjects?`<button class="btn btn-primary" data-action="new-project"><span class="material-symbols-rounded">add</span>Thêm dự án</button>`:'',APP.permissions.canImport?`<button class="btn" data-action="open-import" data-module="projects"><span class="material-symbols-rounded">upload_file</span>Import</button>`:'',`<button class="btn" data-action="export-xlsx" data-module="projects"><span class="material-symbols-rounded">download</span>Export</button>`].join('');
  const toolbar=moduleToolbar(module,[['Trạng thái',unique((APP.data.fixedOptions?.projectStatus||[]))],['Mức độ ưu tiên',APP.data.fixedOptions?.priority||[]],['Loại dự án',APP.data.categories?.['Loại dự án']||[]]],actions,true);
  const selected=APP.state.selected[module]||new Set();
  const bulk=selected.size?bulkBar(module,selected.size,[['export','Xuất đã chọn','download'],...(APP.permissions.canDelete?[['delete','Xóa','delete']]:[]) ]):'';
  const content=APP.state.view.projects==='table'?renderProjectsTable(paginate(module,rows),module,true):renderProjectCards(paginate(module,rows));
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Dự án','Quản lý dự án nội bộ, người phụ trách, thành viên và tiến độ',actions)}${toolbar}${bulk}<div class="panel table-panel">${content}${tableFooter(module,rows.length)}</div></div>`;
}
function renderProjectCards(rows){if(!rows.length)return emptyState('folder_off','Không có dự án','Hãy tạo dự án mới hoặc thay đổi bộ lọc đang sử dụng.');return `<div class="card-grid" style="padding:10px">${rows.map(p=>{const members=(APP.data.projectMembers||[]).filter(m=>m['Mã dự án']===p['Mã dự án']);return `<article class="panel entity-card"><div class="entity-card-top"><div class="entity-title"><div class="entity-icon"><span class="material-symbols-rounded">folder_open</span></div><div><h3 title="${escapeAttr(p['Tên dự án'])}">${escapeHtml(p['Tên dự án'])}</h3><p>${escapeHtml(p['Mã dự án'])} · ${escapeHtml(p['Loại dự án'])}</p></div></div><div>${statusBadge(p['Trạng thái'])}</div></div><div style="margin-top:12px"><div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);margin-bottom:5px"><span>Tiến độ dự án</span><strong style="color:var(--text)">${round1(p['Tiến độ (%)']||0)}%</strong></div><div class="progress"><span style="width:${clamp(Number(p['Tiến độ (%)']||0),0,100)}%"></span></div></div><div class="entity-meta"><div><small>Người phụ trách</small><strong>${escapeHtml(employeeName(p['Mã người phụ trách']))}</strong></div><div><small>Hạn dự kiến</small><strong>${formatDate(p['Ngày dự kiến kết thúc'])}</strong></div><div><small>Ưu tiên</small>${statusBadge(p['Mức độ ưu tiên'])}</div><div><small>Thành viên</small><strong>${members.length} người</strong></div></div><div class="entity-footer"><div class="people-stack">${members.slice(0,5).map(m=>avatarHtml(m['Mã nhân sự'],28)).join('')}</div><div class="row-actions"><button class="row-action" data-action="view-project" data-id="${p['Mã dự án']}"><span class="material-symbols-rounded">visibility</span></button>${APP.permissions.canManageProjects?`<button class="row-action" data-action="edit-project" data-id="${p['Mã dự án']}"><span class="material-symbols-rounded">edit</span></button>`:''}${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-project" data-id="${p['Mã dự án']}"><span class="material-symbols-rounded">delete</span></button>`:''}</div></div></article>`}).join('')}</div>`;}
function renderProjectsTable(rows,module='projects',selectable=true){if(!rows.length)return emptyState('folder_off','Không có dự án','Không tìm thấy dự án phù hợp.');const state=visibleSelectionState(module,rows);return `<div class="data-table-wrap"><table class="data-table"><thead><tr>${selectable?`<th style="width:42px"><input class="check" type="checkbox" data-select-all data-module="${module}" ${state.all?'checked':''} data-selection-some="${state.some?'1':'0'}"></th>`:''}<th style="width:95px">Thao tác</th><th>Dự án</th><th>Phụ trách</th><th>Thời gian</th><th>Ưu tiên</th><th>Trạng thái</th><th>Tiến độ</th></tr></thead><tbody>${rows.map(p=>`<tr>${selectable?`<td><input class="check" type="checkbox" data-row-select data-module="${module}" data-id="${p['Mã dự án']}" ${isSelected(module,p['Mã dự án'])?'checked':''}></td>`:''}<td><div class="row-actions"><button class="row-action" data-action="view-project" data-id="${p['Mã dự án']}"><span class="material-symbols-rounded">visibility</span></button>${APP.permissions.canManageProjects?`<button class="row-action" data-action="edit-project" data-id="${p['Mã dự án']}"><span class="material-symbols-rounded">edit</span></button>`:''}</div></td><td class="main-cell"><strong>${escapeHtml(p['Tên dự án'])}</strong><small>${escapeHtml(p['Mã dự án'])} · ${escapeHtml(p['Loại dự án'])}</small></td><td>${personInline(p['Mã người phụ trách'])}</td><td><strong style="font-size:11.5px">${formatDate(p['Ngày bắt đầu'])}</strong><small style="display:block;color:var(--muted)">đến ${formatDate(p['Ngày dự kiến kết thúc'])}</small></td><td>${statusBadge(p['Mức độ ưu tiên'])}</td><td>${statusBadge(p['Trạng thái'])}</td><td><div style="min-width:110px"><div style="display:flex;justify-content:space-between;font-size:10px"><span>Tiến độ</span><b>${round1(p['Tiến độ (%)']||0)}%</b></div><div class="progress" style="margin-top:4px"><span style="width:${clamp(Number(p['Tiến độ (%)']||0),0,100)}%"></span></div></div></td></tr>`).join('')}</tbody></table></div>`;}

/* ========================= TASKS ========================= */
function renderTasks(){
  const module='tasks';let rows=APP.data.tasks||[];
  if(APP.state.taskTab==='mine') rows=rows.filter(t=>t['Mã người phụ trách']===APP.session.employeeId || (APP.data.taskParticipants||[]).some(p=>p['Mã công việc']===t['Mã công việc']&&p['Mã nhân sự']===APP.session.employeeId));
  if(APP.state.taskTab==='waiting') rows=rows.filter(t=>t['Trạng thái']==='Chờ xác nhận');
  rows=periodFilter(rows,'Hạn hoàn thành'); rows=applySearchFilter(module,rows,['Mã công việc','Tên công việc','Mã dự án','Nhóm công việc','Mã người phụ trách','Trạng thái']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Ngày tạo');
  const canBulkRemind=Boolean(APP.permissions.canSendReminders||APP.permissions.canManageTasks||APP.permissions.canConfirmTask||APP.permissions.isAdmin||APP.permissions.isManager);
  const actions=[APP.state.taskTab==='all'&&canBulkRemind?`<button class="btn btn-remind-all" data-action="preview-bulk-task-reminders"><span class="material-symbols-rounded">notifications_active</span>Nhắc việc tất cả</button>`:'',APP.permissions.canCreateTask?`<button class="btn btn-primary" data-action="new-task"><span class="material-symbols-rounded">add_task</span>Giao công việc</button>`:'',APP.permissions.canImport?`<button class="btn" data-action="open-import" data-module="tasks"><span class="material-symbols-rounded">upload_file</span>Import</button>`:'',`<button class="btn" data-action="export-xlsx" data-module="tasks"><span class="material-symbols-rounded">download</span>Export</button>`].join('');
  const tabs=`<div class="subtabs"><button class="${APP.state.taskTab==='all'?'active':''}" data-action="tab-switch" data-group="taskTab" data-value="all">Tất cả công việc</button><button class="${APP.state.taskTab==='mine'?'active':''}" data-action="tab-switch" data-group="taskTab" data-value="mine">Công việc của tôi</button><button class="${APP.state.taskTab==='waiting'?'active':''}" data-action="tab-switch" data-group="taskTab" data-value="waiting">Chờ xác nhận</button></div>`;
  const toolbar=moduleToolbar(module,[['Trạng thái',APP.data.fixedOptions?.taskStatus||[]],['Mức độ ưu tiên',APP.data.fixedOptions?.priority||[]],['Nhóm công việc',APP.data.categories?.['Nhóm công việc']||[]],['Mã dự án',(APP.data.projects||[]).map(p=>p['Mã dự án'])]],'',false);
  const selected=APP.state.selected[module]||new Set();const bulk=selected.size?bulkBar(module,selected.size,[['export','Xuất đã chọn','download'],...(APP.permissions.canConfirmTask?[['status','Đổi trạng thái','sync_alt']]:[]),...(APP.permissions.canDelete?[['delete','Xóa','delete']]:[])]):'';
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Công việc','Theo dõi trách nhiệm chính, người tham gia, hạn hoàn thành và luồng xác nhận',actions)}<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">${tabs}</div>${toolbar}${bulk}<div class="panel table-panel">${renderTasksTable(paginate(module,rows),module,true)}${tableFooter(module,rows.length)}</div></div>`;
}
function renderTasksTable(rows,module='tasks',selectable=true){
  if(!rows.length)return emptyState('task_alt','Không có công việc','Không tìm thấy công việc phù hợp với kỳ hoặc bộ lọc đang chọn.');
  return `<div class="data-table-wrap"><table class="data-table" style="min-width:1120px"><thead><tr>${selectable?`<th style="width:42px"><input class="check" type="checkbox" data-select-all data-module="${module}"></th>`:''}<th style="width:105px">Thao tác</th><th>Công việc</th><th>Dự án</th><th>Người phụ trách</th><th>Hạn hoàn thành</th><th>Ưu tiên</th><th>Trạng thái</th><th>Tiến độ</th></tr></thead><tbody>${rows.map(t=>{
    let flowAction='';
    if(t['Trạng thái']==='Chờ xác nhận'&&APP.permissions.canConfirmTask){
      flowAction=`<button class="row-action" data-action="confirm-task" data-id="${t['Mã công việc']}" title="Xác nhận hoặc trả lại"><span class="material-symbols-rounded">fact_check</span></button>`;
    }else if(t['Trạng thái']==='Hoàn thành'&&APP.permissions.canConfirmTask){
      flowAction=`<button class="row-action" data-action="reopen-task" data-id="${t['Mã công việc']}" title="Mở lại công việc"><span class="material-symbols-rounded">restart_alt</span></button>`;
    }else{
      flowAction=`<button class="row-action" data-action="task-status" data-id="${t['Mã công việc']}" title="Cập nhật trạng thái"><span class="material-symbols-rounded">sync_alt</span></button>`;
    }
    return `<tr>${selectable?`<td><input class="check" type="checkbox" data-row-select data-module="${module}" data-id="${t['Mã công việc']}" ${isSelected(module,t['Mã công việc'])?'checked':''}></td>`:''}<td><div class="row-actions"><button class="row-action" data-action="view-task" data-id="${t['Mã công việc']}" title="Xem hồ sơ"><span class="material-symbols-rounded">visibility</span></button>${canEditTask(t)?`<button class="row-action" data-action="edit-task" data-id="${t['Mã công việc']}" title="Sửa"><span class="material-symbols-rounded">edit</span></button>`:''}${flowAction}</div></td><td class="main-cell"><strong>${escapeHtml(t['Tên công việc'])}</strong><small>${escapeHtml(t['Mã công việc'])} · ${escapeHtml(t['Nhóm công việc'])}</small></td><td><strong style="font-size:11.5px">${escapeHtml(projectName(t['Mã dự án']))}</strong><small style="display:block;color:var(--muted)">${escapeHtml(t['Mã dự án'])}</small></td><td>${personInline(t['Mã người phụ trách'])}</td><td class="${isTaskOverdue(t)?'text-danger':''}"><strong style="font-size:11.5px">${formatDate(t['Hạn hoàn thành'])}</strong>${isTaskOverdue(t)?'<small style="display:block">Quá hạn</small>':''}</td><td>${statusBadge(t['Mức độ ưu tiên'])}</td><td>${statusBadge(isTaskOverdue(t)?'Quá hạn':t['Trạng thái'])}</td><td><div style="min-width:95px"><div class="progress"><span style="width:${clamp(Number(t['Tiến độ (%)']||0),0,100)}%"></span></div><small style="display:block;margin-top:3px;color:var(--muted)">${round1(t['Tiến độ (%)']||0)}%</small></div></td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function canEditTask(t){return APP.permissions.canManageTasks || t['Mã người phụ trách']===APP.session.employeeId;}

/* ========================= CALENDAR ========================= */
function renderCalendar(){
  const d=APP.state.calendarDate||new Date(),year=d.getFullYear(),month=d.getMonth();const first=new Date(year,month,1),gridStart=new Date(year,month,1-first.getDay());
  const days=Array.from({length:42},(_,i)=>new Date(gridStart.getFullYear(),gridStart.getMonth(),gridStart.getDate()+i));
  const tasks=APP.data.tasks||[];
  const cells=days.map(day=>{const dayTasks=tasks.filter(t=>sameDay(parseDate(t['Hạn hoàn thành']),day));const outside=day.getMonth()!==month;const today=sameDay(day,new Date());return `<div class="calendar-day ${outside?'outside':''} ${today?'today':''}"><span class="calendar-date">${day.getDate()}</span>${dayTasks.slice(0,4).map(t=>`<div class="calendar-event ${t['Trạng thái']==='Hoàn thành'?'done':isTaskOverdue(t)?'overdue':''}" data-action="view-task" data-id="${t['Mã công việc']}" title="${escapeAttr(t['Tên công việc'])}">${escapeHtml(t['Tên công việc'])}</div>`).join('')}${dayTasks.length>4?`<small style="color:var(--muted)">+${dayTasks.length-4} việc</small>`:''}</div>`}).join('');
  const upcoming=tasks.filter(t=>{const due=parseDate(t['Hạn hoàn thành']);return due&&due>=startOfDay(new Date())&&due<=new Date(Date.now()+14*86400000)&&t['Trạng thái']!=='Hoàn thành'&&t['Trạng thái']!=='Đã hủy';}).sort((a,b)=>parseDate(a['Hạn hoàn thành'])-parseDate(b['Hạn hoàn thành']));
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Lịch công việc','Click vào công việc trên lịch để mở hồ sơ và cập nhật tiến độ')}<div class="calendar-layout"><div class="panel calendar-card"><div class="calendar-head"><div class="row-actions"><button class="row-action" data-action="calendar-prev"><span class="material-symbols-rounded">chevron_left</span></button><button class="btn btn-sm" data-action="calendar-today">Hôm nay</button><button class="row-action" data-action="calendar-next"><span class="material-symbols-rounded">chevron_right</span></button></div><h2>Tháng ${String(month+1).padStart(2,'0')}/${year}</h2><button class="btn btn-sm" data-page="tasks"><span class="material-symbols-rounded">list</span>Danh sách</button></div><div class="calendar-week">${['CN','T2','T3','T4','T5','T6','T7'].map(x=>`<div>${x}</div>`).join('')}</div><div class="calendar-grid">${cells}</div></div><aside class="panel agenda"><div class="section-title-row"><h2>14 ngày tới</h2><span class="badge badge-blue">${upcoming.length}</span></div><div class="agenda-list">${upcoming.length?upcoming.slice(0,20).map(t=>`<div class="agenda-item"><strong>${escapeHtml(t['Tên công việc'])}</strong><small>${formatDate(t['Hạn hoàn thành'])} · ${escapeHtml(employeeName(t['Mã người phụ trách']))}</small><div style="margin-top:5px">${statusBadge(t['Mức độ ưu tiên'])}</div></div>`).join(''):emptyState('event_available','Không có việc sắp đến hạn','Lịch 14 ngày tới đang trống.')}</div></aside></div></div>`;
}
function changeCalendarMonth(delta){const d=APP.state.calendarDate;APP.state.calendarDate=new Date(d.getFullYear(),d.getMonth()+delta,1);renderCurrentPage();}function goCalendarToday(){APP.state.calendarDate=new Date();renderCurrentPage();}

/* ========================= KPI PAGES ========================= */
function renderKpiMonth(){
  const module='kpiMonths';let rows=periodFilter(APP.data.kpiMonths||[],'Kỳ');rows=applySearchFilter(module,rows,['Mã KPI tháng','Mã nhân sự','Trạng thái KPI','Xếp loại']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Kỳ');
  const actions=[APP.permissions.canEvaluateKpi?`<button class="btn btn-primary" data-action="new-kpi"><span class="material-symbols-rounded">add</span>Tạo KPI tháng</button>`:'',`<button class="btn" data-action="export-xlsx" data-module="kpiMonths"><span class="material-symbols-rounded">download</span>Export</button>`].join('');
  const toolbar=moduleToolbar(module,[['Trạng thái KPI',APP.data.fixedOptions?.kpiStatus||[]],['Xếp loại',['Vượt mục tiêu','Tốt','Đạt','Cần cải thiện','Chưa đạt']]],'',true);
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('KPI tháng','Điểm KPI tối đa 120. Nhóm xem kết quả, quản lý đánh giá và chốt theo phạm vi.',actions)}${toolbar}<div class="panel table-panel">${APP.state.view.kpi==='cards'?renderKpiCards(paginate(module,rows)):renderKpiTable(paginate(module,rows))}${tableFooter(module,rows.length)}</div></div>`;
}
function renderKpiCards(rows){if(!rows.length)return emptyState('speed','Chưa có KPI trong kỳ','Quản lý có thể tạo KPI tháng từ mẫu KPI đang áp dụng.');return `<div class="card-grid" style="padding:10px">${rows.map(k=>`<article class="panel entity-card"><div class="entity-card-top"><div class="entity-title">${avatarHtml(k['Mã nhân sự'],40)}<div><h3>${escapeHtml(employeeName(k['Mã nhân sự']))}</h3><p>${formatPeriod(k['Kỳ'])} · ${escapeHtml(findEmployee(k['Mã nhân sự'])?.['Nhóm']||'')}</p></div></div>${statusBadge(k['Trạng thái KPI'])}</div><div style="display:flex;align-items:end;justify-content:space-between;margin:14px 0 7px"><div><small class="muted">Điểm KPI</small><div style="font-size:30px;font-weight:700;line-height:1">${round1(k['Tổng điểm KPI']||0)}<span style="font-size:13px;color:var(--muted)">/120</span></div></div>${statusBadge(k['Xếp loại']||'Chưa xếp loại')}</div><div class="progress"><span style="width:${Math.min(100,Number(k['Tổng điểm KPI']||0)/1.2)}%"></span></div><div class="entity-meta"><div><small>Quản lý đánh giá</small><strong>${escapeHtml(employeeName(k['Mã quản lý đánh giá']))}</strong></div><div><small>Ngày đánh giá</small><strong>${formatDate(k['Ngày đánh giá'])||'Chưa đánh giá'}</strong></div></div><div class="entity-footer"><span class="muted" style="font-size:10px">${escapeHtml(k['Mã KPI tháng'])}</span><div class="row-actions"><button class="row-action" data-action="view-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">visibility</span></button>${APP.permissions.canEvaluateKpi&&k['Trạng thái KPI']!=='Đã chốt'?`<button class="row-action" data-action="evaluate-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">edit_note</span></button>`:''}${APP.permissions.canFinalizeKpi&&k['Trạng thái KPI']==='Đã đánh giá'?`<button class="row-action" data-action="finalize-kpi" data-id="${k['Mã KPI tháng']}" title="Chốt KPI"><span class="material-symbols-rounded">lock</span></button>`:''}${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-kpi" data-id="${k['Mã KPI tháng']}" title="Xóa KPI tháng"><span class="material-symbols-rounded">delete</span></button>`:''}</div></div></article>`).join('')}</div>`;}
function renderKpiTable(rows){if(!rows.length)return emptyState('speed','Chưa có KPI','Không có dữ liệu KPI phù hợp.');return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Thao tác</th><th>Nhân sự</th><th>Kỳ</th><th>Quản lý</th><th>Trạng thái</th><th>Điểm KPI</th><th>Xếp loại</th><th>Ngày chốt</th></tr></thead><tbody>${rows.map(k=>`<tr><td><div class="row-actions"><button class="row-action" data-action="view-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">visibility</span></button>${APP.permissions.canEvaluateKpi&&k['Trạng thái KPI']!=='Đã chốt'?`<button class="row-action" data-action="evaluate-kpi" data-id="${k['Mã KPI tháng']}" title="Đánh giá KPI"><span class="material-symbols-rounded">edit</span></button>`:''}${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-kpi" data-id="${k['Mã KPI tháng']}" title="Xóa KPI tháng"><span class="material-symbols-rounded">delete</span></button>`:''}</div></td><td>${personInline(k['Mã nhân sự'])}</td><td>${formatPeriod(k['Kỳ'])}</td><td>${escapeHtml(employeeName(k['Mã quản lý đánh giá']))}</td><td>${statusBadge(k['Trạng thái KPI'])}</td><td><strong class="${Number(k['Tổng điểm KPI'])>100?'text-success':''}">${round1(k['Tổng điểm KPI']||0)}</strong> / 120</td><td>${statusBadge(k['Xếp loại']||'Chưa xếp loại')}</td><td>${formatDate(k['Ngày chốt'])||'-'}</td></tr>`).join('')}</tbody></table></div>`;}
function renderKpiEvaluation(){
  let rows=periodFilter(APP.data.kpiMonths||[],'Kỳ').filter(k=>k['Trạng thái KPI']!=='Đã chốt'); rows=applySearchFilter('kpiEvaluation',rows,['Mã nhân sự','Trạng thái KPI']);
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Đánh giá KPI','Chỉ tiêu tự động lấy từ công việc. Nhóm tự nhập điểm cho các chỉ tiêu đánh giá thủ công.')}<div class="panel table-panel">${rows.length?`<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Thao tác</th><th>Nhân sự</th><th>Kỳ</th><th>Trạng thái</th><th>Điểm hiện tại</th><th>Chỉ tiêu cần đánh giá</th></tr></thead><tbody>${rows.map(k=>{const details=kpiDetails(k['Mã KPI tháng']);const manual=details.filter(d=>d['Nguồn số liệu']==='Nhóm tự nhập'&&d['Trạng thái']!=='Đã đánh giá').length;return `<tr><td><button class="btn btn-sm btn-primary" data-action="evaluate-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">fact_check</span>Đánh giá</button></td><td>${personInline(k['Mã nhân sự'])}</td><td>${formatPeriod(k['Kỳ'])}</td><td>${statusBadge(k['Trạng thái KPI'])}</td><td><strong>${round1(k['Tổng điểm KPI']||0)}</strong> / 120</td><td><span class="badge ${manual?'badge-orange':'badge-green'}">${manual?manual+' chỉ tiêu':'Đã đủ dữ liệu'}</span></td></tr>`}).join('')}</tbody></table></div>`:emptyState('fact_check','Không có KPI chờ đánh giá','Các KPI chưa chốt sẽ hiển thị ở đây.')}</div></div>`;
}
function renderKpiFinalize(){
  const rows=periodFilter(APP.data.kpiMonths||[],'Kỳ').filter(k=>k['Trạng thái KPI']==='Đã đánh giá');
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Chốt KPI','Kiểm tra điểm, xếp loại và khóa kết quả sau khi hoàn tất đánh giá.')}<div class="panel table-panel">${rows.length?`<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Thao tác</th><th>Nhân sự</th><th>Kỳ</th><th>Điểm</th><th>Xếp loại</th><th>Nhận xét</th></tr></thead><tbody>${rows.map(k=>`<tr><td><div class="row-actions"><button class="row-action" data-action="view-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">visibility</span></button><button class="btn btn-sm btn-primary" data-action="finalize-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">lock</span>Chốt KPI</button></div></td><td>${personInline(k['Mã nhân sự'])}</td><td>${formatPeriod(k['Kỳ'])}</td><td><strong class="${Number(k['Tổng điểm KPI'])>100?'text-success':''}">${round1(k['Tổng điểm KPI']||0)}</strong> /120</td><td>${statusBadge(k['Xếp loại'])}</td><td>${escapeHtml(k['Nhận xét tổng hợp']||'')}</td></tr>`).join('')}</tbody></table></div>`:emptyState('lock_open','Không có KPI chờ chốt','KPI đã đánh giá sẽ xuất hiện tại đây.')}</div></div>`;
}
function renderKpiTemplates(){
  let rows=APP.data.kpiTemplates||[];rows=applySearchFilter('kpiTemplates',rows,['Mã mẫu KPI','Tên mẫu KPI','Giá trị áp dụng','Trạng thái']);
  const actions=`<button class="btn btn-primary" data-action="new-template"><span class="material-symbols-rounded">add</span>Thêm mẫu KPI</button><button class="btn" data-action="export-xlsx" data-module="kpiTemplates"><span class="material-symbols-rounded">download</span>Export</button>`;
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Mẫu KPI','Mỗi bộ KPI gồm các chỉ tiêu, mục tiêu, trọng số và cách ghi nhận. Tổng trọng số cần bằng 100%.',actions)}${moduleToolbar('kpiTemplates',[['Trạng thái',['Đang áp dụng','Ngừng áp dụng']]],'',false)}<div class="panel table-panel">${rows.length?`<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Thao tác</th><th>Mẫu KPI</th><th>Áp dụng</th><th>Ngày hiệu lực</th><th>Chỉ tiêu</th><th>Trọng số</th><th>Trạng thái</th></tr></thead><tbody>${rows.map(t=>{const details=(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===t['Mã mẫu KPI']);const weight=details.reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0);return `<tr><td><div class="row-actions"><button class="row-action" data-action="view-template" data-id="${t['Mã mẫu KPI']}"><span class="material-symbols-rounded">visibility</span></button><button class="row-action" data-action="edit-template" data-id="${t['Mã mẫu KPI']}"><span class="material-symbols-rounded">edit</span></button>${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-template" data-id="${t['Mã mẫu KPI']}"><span class="material-symbols-rounded">delete</span></button>`:''}</div></td><td class="main-cell"><strong>${escapeHtml(t['Tên mẫu KPI'])}</strong><small>${escapeHtml(t['Mã mẫu KPI'])}</small></td><td>${escapeHtml(t['Phạm vi áp dụng'])}: <strong>${escapeHtml(t['Giá trị áp dụng'])}</strong></td><td>${formatDate(t['Ngày hiệu lực'])}</td><td>${details.length}</td><td><span class="badge ${Math.round(weight)===100?'badge-green':'badge-red'}">${round1(weight)}%</span></td><td>${statusBadge(t['Trạng thái'])}</td></tr>`}).join('')}</tbody></table></div>`:emptyState('description','Chưa có mẫu KPI','Hãy tạo bộ KPI đầu tiên cho Nhóm.')}</div></div>`;
}

/* ========================= EMPLOYEES ========================= */
function renderEmployees(){
  const module='employees';let rows=applySearchFilter(module,APP.data.employees||[],['Mã nhân sự','Họ và tên','Nhóm','Chức vụ','Email','Số điện thoại','Trạng thái']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Mã nhân sự');
  const actions=[APP.permissions.canManageEmployees?`<button class="btn btn-primary" data-action="new-employee"><span class="material-symbols-rounded">person_add</span>Thêm nhân sự</button>`:'',(APP.permissions.canManageEmployees&&APP.permissions.canImport)?`<button class="btn" data-action="open-import" data-module="employees"><span class="material-symbols-rounded">upload_file</span>Import</button>`:'',`<button class="btn" data-action="export-xlsx" data-module="employees"><span class="material-symbols-rounded">download</span>Export</button>`].join('');
  const toolbar=moduleToolbar(module,[['Nhóm',activeTeamOptions().map(o=>o.value)],['Chức vụ',APP.data.categories?.['Chức vụ']||[]],['Trạng thái',['Đang làm','Tạm nghỉ','Đã nghỉ']]],actions,true);
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Nhân sự','Hồ sơ nhân sự dùng xuyên suốt dự án, giao việc, phân quyền và KPI',actions)}${toolbar}<div class="panel table-panel">${APP.state.view.employees==='cards'?renderEmployeeCards(paginate(module,rows)):renderEmployeesTable(paginate(module,rows))}${tableFooter(module,rows.length)}</div></div>`;
}
function renderEmployeeCards(rows){if(!rows.length)return emptyState('groups','Không có nhân sự','Không tìm thấy nhân sự phù hợp.');return `<div class="card-grid" style="padding:10px">${rows.map(e=>{const tasks=(APP.data.tasks||[]).filter(t=>t['Mã người phụ trách']===e['Mã nhân sự']);const kpi=(APP.data.kpiMonths||[]).filter(k=>k['Mã nhân sự']===e['Mã nhân sự']).sort((a,b)=>parseDate(b['Kỳ'])-parseDate(a['Kỳ']))[0];return `<article class="panel entity-card"><div class="entity-card-top"><div class="entity-title">${avatarHtml(e['Mã nhân sự'],45)}<div><h3>${escapeHtml(e['Họ và tên'])}</h3><p>${escapeHtml(e['Mã nhân sự'])} · ${escapeHtml(e['Chức vụ'])}</p></div></div>${statusBadge(e['Trạng thái'])}</div><div class="entity-meta"><div><small>Nhóm</small><strong>${escapeHtml(e['Nhóm'])}</strong></div><div><small>Quản lý</small><strong>${escapeHtml(employeeName(e['Mã quản lý trực tiếp'])||'-')}</strong></div><div><small>Công việc phụ trách</small><strong>${tasks.length}</strong></div><div><small>KPI gần nhất</small><strong class="${Number(kpi?.['Tổng điểm KPI']||0)>100?'text-success':''}">${kpi?round1(kpi['Tổng điểm KPI'])+'%':'-'}</strong></div></div><div class="entity-footer"><span class="muted" style="font-size:10px">${escapeHtml(e['Email']||e['Số điện thoại']||'')}</span><div class="row-actions"><button class="row-action" data-action="view-employee" data-id="${e['Mã nhân sự']}"><span class="material-symbols-rounded">visibility</span></button>${APP.permissions.canManageEmployees?`<button class="row-action" data-action="edit-employee" data-id="${e['Mã nhân sự']}" title="Sửa nhân sự"><span class="material-symbols-rounded">edit</span></button>`:''}${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-employee" data-id="${e['Mã nhân sự']}" title="Xóa nhân sự"><span class="material-symbols-rounded">delete</span></button>`:''}</div></div></article>`}).join('')}</div>`;}
function renderEmployeesTable(rows){if(!rows.length)return emptyState('groups','Không có nhân sự','Không tìm thấy nhân sự phù hợp.');return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Thao tác</th><th>Nhân sự</th><th>Nhóm</th><th>Chức vụ</th><th>Quản lý trực tiếp</th><th>Liên hệ</th><th>Ngày tháng năm sinh</th><th>Trạng thái</th></tr></thead><tbody>${rows.map(e=>`<tr><td><div class="row-actions"><button class="row-action" data-action="view-employee" data-id="${e['Mã nhân sự']}"><span class="material-symbols-rounded">visibility</span></button>${APP.permissions.canManageEmployees?`<button class="row-action" data-action="edit-employee" data-id="${e['Mã nhân sự']}" title="Sửa nhân sự"><span class="material-symbols-rounded">edit</span></button>`:''}${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-employee" data-id="${e['Mã nhân sự']}" title="Xóa nhân sự"><span class="material-symbols-rounded">delete</span></button>`:''}</div></td><td>${personInline(e['Mã nhân sự'])}</td><td>${escapeHtml(e['Nhóm'])}</td><td>${escapeHtml(e['Chức vụ'])}</td><td>${escapeHtml(employeeName(e['Mã quản lý trực tiếp'])||'-')}</td><td><strong style="font-size:11.5px">${escapeHtml(e['Email']||'')}</strong><small style="display:block;color:var(--muted)">${escapeHtml(formatPhone(e['Số điện thoại']))}</small></td><td>${formatDate(e['Ngày tháng năm sinh'])}</td><td>${statusBadge(e['Trạng thái'])}</td></tr>`).join('')}</tbody></table></div>`;}

/* ========================= CATEGORIES ========================= */
function renderCategories(){
  const cats=APP.data.categories||{};
  const groups=Object.keys(cats);
  const current=APP.state.categoryTab&&groups.includes(APP.state.categoryTab)?APP.state.categoryTab:groups[0];
  APP.state.categoryTab=current;
  const query=normalizeText(APP.state.search.categories||'');
  const allValues=cats[current]||[];
  const values=allValues.filter(v=>!query||normalizeText(v).includes(query)||normalizeText(categoryUsageLabel(current,v)).includes(query));
  const totalValues=groups.reduce((sum,g)=>sum+(cats[g]||[]).length,0);
  const actions=current?`<button class="btn btn-primary" data-action="new-category" data-group="${escapeAttr(current)}"><span class="material-symbols-rounded">add</span>Thêm giá trị</button>`:'';
  document.getElementById('page-content').innerHTML=`<div class="page-shell category-page-v3">${pageHead('Danh mục','Quản lý dữ liệu nền dùng chung cho biểu mẫu, bộ lọc và báo cáo.',actions)}
    <div class="category-summary-grid">
      <div class="panel category-summary"><span class="material-symbols-rounded">category</span><div><small>Nhóm danh mục</small><strong>${groups.length}</strong></div></div>
      <div class="panel category-summary"><span class="material-symbols-rounded">database</span><div><small>Tổng giá trị</small><strong>${totalValues}</strong></div></div>
      <div class="panel category-summary"><span class="material-symbols-rounded">sell</span><div><small>Nhóm đang chọn</small><strong>${escapeHtml(current||'-')}</strong></div></div>
    </div>
    <section class="panel category-workspace">
      <aside class="category-sidebar">
        <div class="category-sidebar-head"><strong>Nhóm dữ liệu</strong><small>Chọn nhóm để quản lý</small></div>
        <div class="category-group-list">${groups.map(g=>`<button class="category-group-item ${g===current?'active':''}" data-action="tab-switch" data-group="categoryTab" data-value="${escapeAttr(g)}"><span>${escapeHtml(g)}</span><b>${(cats[g]||[]).length}</b></button>`).join('')}</div>
      </aside>
      <div class="category-main">
        <div class="category-main-head"><div><h2>${escapeHtml(current||'Danh mục')}</h2><p>${allValues.length} giá trị đang được cấu hình.</p></div><button class="btn btn-primary btn-sm" data-action="new-category" data-group="${escapeAttr(current||'')}"><span class="material-symbols-rounded">add</span>Thêm</button></div>
        <div class="category-search"><span class="material-symbols-rounded">search</span><input data-search-module="categories" value="${escapeAttr(APP.state.search.categories||'')}" placeholder="Tìm giá trị hoặc nơi đang sử dụng..."></div>
        <div class="category-table-wrap">${values.length?`<table class="data-table category-table"><thead><tr><th>Giá trị</th><th>Đang được sử dụng</th><th style="width:112px;text-align:center">Thao tác</th></tr></thead><tbody>${values.map(v=>`<tr><td><div class="category-value-cell"><span class="material-symbols-rounded">label</span><strong>${escapeHtml(v)}</strong></div></td><td><span class="category-usage">${escapeHtml(categoryUsageLabel(current,v))}</span></td><td><div class="row-actions category-actions"><button class="row-action edit" data-action="edit-category" data-group="${escapeAttr(current)}" data-value="${encodeURIComponent(v)}" title="Sửa"><span class="material-symbols-rounded">edit</span></button><button class="row-action danger" data-action="delete-category" data-group="${escapeAttr(current)}" data-value="${encodeURIComponent(v)}" title="Xóa"><span class="material-symbols-rounded">delete</span></button></div></td></tr>`).join('')}</tbody></table>`:emptyState('search_off','Không có giá trị phù hợp',query?'Thử từ khóa khác hoặc xóa nội dung tìm kiếm.':'Thêm giá trị để sử dụng trong biểu mẫu.')}</div>
      </div>
    </section>
  </div>`;
}

/* ========================= FILES ========================= */
function renderFiles(){
  const module='files';
  // Task attachments are scoped to their own task profile and intentionally
  // excluded from this general documents page to prevent unrelated task files
  // from being mixed together. They remain available via filesFor('Công việc', taskId).
  let rows=(APP.data.files||[]).filter(f=>String(f['Module liên quan']||'').trim()!=='Công việc');
  rows=applySearchFilter(module,rows,['Mã tài liệu','Tên file','Module liên quan','Mã bản ghi liên quan','Loại tài liệu','Người upload']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Ngày upload');
  const actions=`<button class="btn btn-primary" data-action="upload-file"><span class="material-symbols-rounded">upload</span>Upload tài liệu</button><button class="btn" data-action="export-xlsx" data-module="files"><span class="material-symbols-rounded">download</span>Export</button>`;
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Tài liệu','Danh sách này chỉ hiển thị tài liệu chung của dự án và KPI. Tệp đính kèm công việc chỉ xuất hiện trong hồ sơ của đúng công việc đó.',actions)}${moduleToolbar(module,[['Module liên quan',['Dự án','KPI tháng']],['Loại tài liệu',APP.data.categories?.['Loại tài liệu']||[]]],'',false)}<div class="panel table-panel">${rows.length?`<div class="file-list" style="padding:10px">${paginatedRows(module,rows).map(f=>fileCard(f)).join('')}</div>`:emptyState('folder_copy','Chưa có tài liệu chung','Tài liệu thuộc từng công việc được xem trong hồ sơ của công việc đó.')}${tableFooter(module,rows.length)}</div></div>`;
}
function fileCard(f){return `<article class="panel file-card"><div class="file-card-top"><div class="file-type"><span class="material-symbols-rounded">${fileIcon(f['MIME type'])}</span></div><div style="min-width:0;flex:1"><h3 title="${escapeAttr(f['Tên file'])}">${escapeHtml(f['Tên file'])}</h3><p>${escapeHtml(f['Loại tài liệu'])} · ${formatFileSize(Number(f['Dung lượng KB']||0)*1024)}</p><p>${escapeHtml(f['Module liên quan'])} ${escapeHtml(f['Mã bản ghi liên quan'])}</p></div></div><div class="file-card-footer"><span class="muted" style="font-size:10px">${formatDate(f['Ngày upload'])} · ${escapeHtml(employeeName(f['Người upload']))}</span><div class="row-actions"><button class="row-action" data-action="view-file" data-file-id="${escapeAttr(f['File ID'])}" data-doc-id="${escapeAttr(f['Mã tài liệu'])}"><span class="material-symbols-rounded">visibility</span></button>${APP.permissions.canDeleteFile?`<button class="row-action danger" data-action="delete-file" data-id="${f['Mã tài liệu']}"><span class="material-symbols-rounded">delete</span></button>`:''}</div></div></article>`;}

/* ========================= REPORTS ========================= */
function renderReports(){
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Báo cáo','Xem nhanh dữ liệu theo kỳ và xuất XLSX khi cần.')}<div class="report-cards"><article class="panel report-card" data-action="report-select" data-report="tasks"><div class="report-card-icon"><span class="material-symbols-rounded">checklist</span></div><h3>Báo cáo công việc</h3><p>Tổng hợp trạng thái, quá hạn, người phụ trách và tiến độ theo kỳ.</p></article><article class="panel report-card" data-action="report-select" data-report="projects"><div class="report-card-icon"><span class="material-symbols-rounded">folder_open</span></div><h3>Báo cáo dự án</h3><p>Tiến độ dự án nội bộ, người phụ trách, trạng thái và thời gian thực hiện.</p></article><article class="panel report-card" data-action="report-select" data-report="kpi"><div class="report-card-icon"><span class="material-symbols-rounded">speed</span></div><h3>Báo cáo KPI</h3><p>Điểm KPI, xếp loại và kết quả nhân sự theo kỳ đang xem.</p></article></div><div id="report-detail"></div></div>`;
  renderReportDetail(APP.state.reportType||'tasks');
}
function renderReportDetail(type){APP.state.reportType=type;const el=document.getElementById('report-detail');if(!el)return;let title,rows,summary,cols;
  if(type==='projects'){title='Báo cáo dự án';rows=APP.data.projects||[];summary=[['Tổng dự án',rows.length],['Đang thực hiện',rows.filter(x=>x['Trạng thái']==='Đang thực hiện').length],['Hoàn thành',rows.filter(x=>x['Trạng thái']==='Hoàn thành').length],['Cần chú ý',rows.filter(isProjectLate).length]];cols='projects';}
  else if(type==='kpi'){title='Báo cáo KPI';rows=periodFilter(APP.data.kpiMonths||[],'Kỳ');summary=[['Số KPI',rows.length],['Điểm trung bình',rows.length?round1(rows.reduce((s,x)=>s+Number(x['Tổng điểm KPI']||0),0)/rows.length):0],['Vượt mục tiêu',rows.filter(x=>Number(x['Tổng điểm KPI'])>100).length],['Đã chốt',rows.filter(x=>x['Trạng thái KPI']==='Đã chốt').length]];cols='kpi';}
  else{title='Báo cáo công việc';rows=periodFilter(APP.data.tasks||[],'Hạn hoàn thành');summary=[['Tổng công việc',rows.length],['Hoàn thành',rows.filter(x=>x['Trạng thái']==='Hoàn thành').length],['Quá hạn',rows.filter(isTaskOverdue).length],['Chờ xác nhận',rows.filter(x=>x['Trạng thái']==='Chờ xác nhận').length]];cols='tasks';}
  el.innerHTML=`<div class="panel report-preview"><div class="section-title-row"><div><h2>${title}</h2><small>${escapeHtml(APP.state.period.label)}</small></div><div class="row-actions"><button class="btn" data-action="export-xlsx" data-module="${cols==='kpi'?'kpiMonths':cols}"><span class="material-symbols-rounded">download</span>Export XLSX</button></div></div><div class="report-summary">${summary.map(([l,v])=>`<div class="stat"><small>${l}</small><strong>${v}</strong></div>`).join('')}</div><div style="margin-top:12px">${cols==='projects'?renderProjectsTable(rows.slice(0,15),'reportProjects',false):cols==='kpi'?renderKpiTable(rows.slice(0,15)):renderTasksTable(rows.slice(0,15),'reportTasks',false)}</div></div>`;
}

/* ========================= AUDIT / USERS / HELP ========================= */
function renderAudit(){let rows=APP.data.audit||[];rows=applySearchFilter('audit',rows,['Mã nhật ký','Mã người dùng','Module','Mã bản ghi','Hành động','Nội dung thay đổi']);rows=sortRows('audit',rows,'Thời gian');document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Nhật ký hoạt động','Theo dõi thao tác quan trọng. Nhật ký chỉ ghi nhận, không chỉnh sửa trực tiếp.')}${moduleToolbar('audit',[['Module',unique(rows.map(x=>x['Module']))],['Hành động',unique(rows.map(x=>x['Hành động']))]],'',false)}<div class="panel table-panel">${rows.length?`<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Thời gian</th><th>Người dùng</th><th>Module</th><th>Bản ghi</th><th>Hành động</th><th>Nội dung</th><th>Kết quả</th></tr></thead><tbody>${paginatedRows('audit',rows).map(a=>`<tr><td>${formatDateTime(a['Thời gian'])}</td><td>${escapeHtml(userName(a['Mã người dùng']))}</td><td>${escapeHtml(a['Module'])}</td><td>${escapeHtml(a['Mã bản ghi'])}</td><td><strong>${escapeHtml(a['Hành động'])}</strong></td><td>${escapeHtml(a['Nội dung thay đổi'])}</td><td>${statusBadge(a['Kết quả']||'Thành công')}</td></tr>`).join('')}</tbody></table></div>`:emptyState('history','Chưa có nhật ký','Các thao tác quan trọng sẽ được ghi nhận tại đây.')}${tableFooter('audit',rows.length)}</div></div>`;}
function renderUsers(){
  const module='users';let rows=APP.data.users||[];rows=applySearchFilter(module,rows,['Mã người dùng','Tên đăng nhập','Vai trò','Mã nhân sự','Phạm vi dữ liệu','Trạng thái']);rows=applyGenericFilters(module,rows);
  const actions=`<button class="btn btn-primary" data-action="new-user"><span class="material-symbols-rounded">person_add</span>Thêm người dùng</button><button class="btn" data-action="export-xlsx" data-module="users"><span class="material-symbols-rounded">download</span>Export</button>`;
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Người dùng','Tài khoản được liên kết với Nhân sự để xác định quyền và phạm vi dữ liệu.',actions)}${moduleToolbar(module,[['Vai trò',APP.data.fixedOptions?.userRole||[]],['Trạng thái',APP.data.fixedOptions?.userStatus||[]]],actions,true)}<div class="panel table-panel">${rows.length?`<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Thao tác</th><th>Tài khoản</th><th>Nhân sự</th><th>Vai trò</th><th>Phạm vi</th><th>Trạng thái</th><th>Đăng nhập gần nhất</th></tr></thead><tbody>${rows.map(u=>`<tr><td><div class="row-actions"><button class="row-action" data-action="edit-user" data-id="${u['Mã người dùng']}"><span class="material-symbols-rounded">edit</span></button>${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-user" data-id="${u['Mã người dùng']}"><span class="material-symbols-rounded">delete</span></button>`:''}</div></td><td class="main-cell"><strong>${escapeHtml(u['Tên đăng nhập'])}</strong><small>${escapeHtml(u['Mã người dùng'])}</small></td><td>${personInline(u['Mã nhân sự'])}</td><td>${statusBadge(u['Vai trò'])}</td><td>${escapeHtml(u['Phạm vi dữ liệu'])}</td><td>${statusBadge(u['Trạng thái'])}</td><td>${formatDateTime(u['Lần đăng nhập gần nhất'])||'-'}</td></tr>`).join('')}</tbody></table></div>`:emptyState('manage_accounts','Chưa có người dùng','Thêm tài khoản và liên kết với nhân sự.')}</div></div>`;
}

/* ========================= BÌNH CHỌN LỊCH (When2meet-style) ========================= */
function scheduleEsc(v){return escapeHtml(String(v==null?'':v));}
function scheduleParseDateOnly(value){
  const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(!m)return null;
  const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
  return d.getFullYear()===Number(m[1])&&d.getMonth()===Number(m[2])-1&&d.getDate()===Number(m[3])?d:null;
}
function scheduleLocalDateValue(date){
  return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
}
function scheduleDateLabel(iso){
  const d=scheduleParseDateOnly(iso);
  return d?d.toLocaleDateString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit'}):String(iso||'');
}
function scheduleTimeSlots(start,end){
  const out=[]; let cur=Number(String(start||'09:00').split(':')[0])*60+Number(String(start||'09:00').split(':')[1]||0);
  const finish=Number(String(end||'17:00').split(':')[0])*60+Number(String(end||'17:00').split(':')[1]||0);
  for(;cur<finish;cur+=30) out.push(String(Math.floor(cur/60)).padStart(2,'0')+':'+String(cur%60).padStart(2,'0'));
  return out;
}
function renderSchedulePolls(){
  const root=document.getElementById('page-content'); if(!root)return;
  const id=APP.state.schedulePollId;
  root.innerHTML=`<div class="page-shell schedule-polls-page">
    <div class="page-head"><div><h1>Bình chọn lịch</h1><p>Tạo sự kiện, chọn ngày và đánh dấu các khung giờ bạn có thể tham gia.</p></div><div class="page-actions"><button class="btn" data-action="schedule-poll-refresh"><span class="material-symbols-rounded">refresh</span>Làm mới</button></div></div>
    <div id="schedule-poll-content"><div class="panel empty-state"><span class="material-symbols-rounded">event_available</span><strong>Đang tải bình chọn lịch...</strong></div></div>
  </div>`;
  loadSchedulePollPage(id);
}
async function loadSchedulePollPage(id){
  const host=document.getElementById('schedule-poll-content'); if(!host)return;
  try{
    if(id){
      const result=await gas('getSchedulePoll',APP.token,id,{timeout:30000});
      APP.state.schedulePoll=result.poll; APP.state.schedulePollVotes=result.votes||[]; APP.state.schedulePollInvitedMembers=result.invitedMembers||[]; APP.state.schedulePollBaseUrl=result.webAppUrl||APP.state.schedulePollBaseUrl||'';
      APP.state.schedulePollSelected=new Set();
      renderSchedulePollDetail(host,result.poll,result.votes||[]);
    }else{
      APP.state.schedulePollId='';
      const result=await gas('listSchedulePolls',APP.token,{timeout:30000});
      APP.state.schedulePolls=result.polls||[];
      APP.state.schedulePollBaseUrl=result.webAppUrl||APP.state.schedulePollBaseUrl||'';
      renderSchedulePollList(host,APP.state.schedulePolls);
    }
  }catch(err){
    host.innerHTML=`<div class="panel empty-state"><span class="material-symbols-rounded">error</span><strong>Không tải được bình chọn lịch</strong><p>${scheduleEsc(err.message)}</p><button class="btn btn-primary" data-action="schedule-poll-refresh">Thử lại</button></div>`;
  }
}
function isSchedulePollNew(createdAt){
  if(!createdAt)return false;
  let stamp=createdAt instanceof Date?createdAt.getTime():Date.parse(String(createdAt));
  if(!Number.isFinite(stamp)){
    const m=String(createdAt).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if(m)stamp=new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0)).getTime();
  }
  return Number.isFinite(stamp)&&stamp>=Date.now()-3*24*60*60*1000&&stamp<=Date.now()+5*60*1000;
}
function canDeleteSchedulePoll(poll){
  const role=String(APP.session?.role||'');
  if(role==='Quản trị')return true;
  return role==='Quản lý'&&String(poll.createdBy||'').trim()===String(APP.session?.employeeName||APP.session?.username||'').trim();
}
async function deleteSchedulePollFromList(id,title){
  if(!id)return;
  showConfirm('Xóa lịch bình chọn',`Bạn có chắc muốn xóa lịch "${title||'này'}"? Lịch sẽ được ẩn khỏi danh sách hoạt động.`,async()=>{
    const toast=showToast('Đang xóa lịch','Đang cập nhật danh sách bình chọn.','processing',0);
    try{
      const result=await gas('deleteSchedulePoll',APP.token,id,{timeout:45000});
      updateToast(toast,'Đã xóa lịch','Lịch đã được ẩn khỏi danh sách hoạt động.','success',3500);
      APP.state.schedulePollId='';
      await loadSchedulePollPage('');
    }catch(err){
      updateToast(toast,'Không thể xóa lịch',err.message||'Đã xảy ra lỗi.','error',5000);
    }
  },'Xóa lịch');
}
function renderSchedulePollList(host,polls){
  const today=new Date(); const start=scheduleLocalDateValue(today);
  const endDate=new Date(today.getFullYear(),today.getMonth(),today.getDate()+6);const end=scheduleLocalDateValue(endDate);
  host.innerHTML=`
  <div class="schedule-poll-layout">
    <section class="panel schedule-poll-create">
      <div class="section-title-row"><h2><span class="material-symbols-rounded">add_circle</span> Tạo bình chọn mới</h2><span class="badge badge-green">Bước 1</span></div>
      <p class="muted">Đặt tên sự kiện, chọn khoảng ngày và giờ. Sau khi tạo, chia sẻ liên kết để mọi người đánh dấu thời gian rảnh.</p>
      <div class="schedule-form-grid">
        <label class="schedule-field schedule-field-wide">Tên sự kiện<input id="schedule-poll-title" maxlength="160" placeholder="Ví dụ: Họp nhóm dự án tháng 11" /></label>
        <label class="schedule-field schedule-field-wide">Mô tả (không bắt buộc)<textarea id="schedule-poll-description" rows="2" placeholder="Mục đích, địa điểm hoặc ghi chú"></textarea></label>
        <label class="schedule-field">Ngày bắt đầu<input id="schedule-poll-start" type="date" value="${start}" min="${start}"/></label>
        <label class="schedule-field">Ngày kết thúc<input id="schedule-poll-end" type="date" value="${end}" min="${start}"/></label>
        <label class="schedule-field">Giờ bắt đầu<select id="schedule-poll-time-start">${scheduleTimeSlots('00:00','23:30').map(t=>`<option value="${t}" ${t==='09:00'?'selected':''}>${t}</option>`).join('')}</select></label>
        <label class="schedule-field">Giờ kết thúc<select id="schedule-poll-time-end">${['12:00','13:00','15:00','17:00','18:00','19:00','20:00','21:00','22:00','23:30'].map(t=>`<option value="${t}" ${t==='17:00'?'selected':''}>${t}</option>`).join('')}</select></label>
        <label class="schedule-field schedule-field-wide">Múi giờ<select id="schedule-poll-timezone"><option value="Asia/Ho_Chi_Minh" selected>Asia/Ho_Chi_Minh (Việt Nam)</option><option value="Asia/Bangkok">Asia/Bangkok</option><option value="UTC">UTC</option><option value="Asia/Singapore">Asia/Singapore</option></select></label>
        <div class="schedule-field schedule-field-wide schedule-invite-picker">
          <div class="schedule-invite-head">
            <strong>Thành viên được mời bình chọn</strong>
            <span class="schedule-invite-count" id="schedule-poll-member-count">0 thành viên</span>
          </div>
          <input id="schedule-poll-member-search" type="search" placeholder="Tìm thành viên theo mã hoặc tên..." autocomplete="off">
          <div id="schedule-poll-member-list" class="schedule-poll-member-list">
            <label class="schedule-poll-select-all-row">
              <input type="checkbox" id="schedule-poll-select-all-checkbox">
              <span><strong>Chọn tất cả thành viên</strong><small>Chọn hoặc bỏ chọn toàn bộ danh sách nhân sự</small></span>
            </label>
            ${schedulePollInviteEmployees().map(e=>`<label class="schedule-poll-member-option"><input type="checkbox" class="schedule-poll-member-check" value="${scheduleEsc(e['Mã nhân sự']||'')}" ${String(e['Mã nhân sự']||'')===String(APP.session?.employeeId||'')?'checked':''}><span><strong>${scheduleEsc(e['Họ và tên']||'Chưa có tên')}</strong><small>${scheduleEsc(e['Mã nhân sự']||'')}</small></span></label>`).join('')||'<p class="muted">Không có nhân sự thuộc phạm vi được phép mời. Hãy kiểm tra danh sách nhân sự và quan hệ quản lý trực tiếp.</p>'}
          </div>
          <small class="muted">Chỉ thành viên được chọn mới thấy sự kiện và được gửi bình chọn. Người tạo được tự động thêm vào danh sách.</small>
        </div>
      </div>
      <div class="schedule-hint"><span class="material-symbols-rounded">info</span> Các ô thời gian chia theo từng 30 phút. Khoảng ngày tối đa 60 ngày.</div>
      <button class="btn btn-primary" data-action="schedule-poll-create"><span class="material-symbols-rounded">calendar_add_on</span>Tạo bình chọn</button>
    </section>
    <section class="panel schedule-poll-list">
      <div class="section-title-row"><h2><span class="material-symbols-rounded">event_note</span> Bình chọn của nhóm</h2><span class="badge badge-gray">${polls.length} sự kiện</span></div>
      ${polls.length?`<div class="schedule-poll-cards">${polls.map(p=>`<article class="schedule-poll-card"><div class="schedule-poll-card-icon"><span class="material-symbols-rounded">event_available</span></div><div class="schedule-poll-card-main"><div class="schedule-poll-card-title-row"><strong>${scheduleEsc(p.title)}</strong>${isSchedulePollNew(p.createdAt)?'<span class="badge badge-red schedule-poll-new-badge">NEW</span>':''}</div><p>${scheduleEsc(p.startDate)} – ${scheduleEsc(p.endDate)} · ${scheduleEsc(p.startTime)}–${scheduleEsc(p.endTime)}</p><small>${Number(p.voteCount||0)} lượt tham gia · Tạo bởi ${scheduleEsc(p.createdBy||'')}</small></div><div class="schedule-poll-card-actions"><button class="btn btn-sm btn-primary" data-action="schedule-poll-open" data-id="${scheduleEsc(p.id)}">Mở</button>${canDeleteSchedulePoll(p)?`<button class="btn btn-sm btn-danger" data-action="schedule-poll-delete" data-id="${scheduleEsc(p.id)}" data-title="${scheduleEsc(p.title)}"><span class="material-symbols-rounded">delete_outline</span>Xóa</button>`:''}</div></article>`).join('')}</div>`:emptyState('event_busy','Chưa có bình chọn lịch','Tạo bình chọn đầu tiên để cả nhóm tìm khung giờ phù hợp.')}
    </section>
  </div>`;
  // Chỉ Quản trị/Quản lý được tạo sự kiện; các vai trò khác chỉ thấy lịch được mời.
  if(!['Quản trị','Quản lý'].includes(String(APP.session?.role||''))) host.querySelector('.schedule-poll-create')?.remove();
  const memberSearch=host.querySelector('#schedule-poll-member-search');
  memberSearch?.addEventListener('input',()=>{
    const q=memberSearch.value.trim().toLocaleLowerCase('vi');
    host.querySelectorAll('.schedule-poll-member-option').forEach(row=>{
      row.classList.toggle('hidden',!row.textContent.toLocaleLowerCase('vi').includes(q));
    });
  });
  host.querySelectorAll('#schedule-poll-member-list input.schedule-poll-member-check').forEach(input=>{
    input.addEventListener('change',syncSchedulePollInviteSelectAll);
  });
  host.querySelector('#schedule-poll-select-all-checkbox')?.addEventListener('change',ev=>{
    setSchedulePollInviteSelection(Boolean(ev.target.checked));
  });
  syncSchedulePollInviteSelectAll();
}
function schedulePeriodForTime(time){
  const parts=String(time||'00:00').split(':').map(Number);const hour=parts[0]||0;
  if(hour>=5&&hour<11)return 'Sáng';
  if(hour>=11&&hour<14)return 'Trưa';
  if(hour>=14&&hour<18)return 'Chiều';
  return 'Tối';
}
function schedulePeriodKey(label){return ({'Sáng':'morning','Trưa':'noon','Chiều':'afternoon','Tối':'evening'})[label]||'other';}
function applyScheduleSlotSelection(button,selected){
  const key=button?.dataset?.slot;if(!key)return;
  const set=APP.state.schedulePollSelected||(APP.state.schedulePollSelected=new Set());
  if(selected)set.add(key);else set.delete(key);
  button.classList.toggle('selected',selected);
  const badge=document.querySelector('.schedule-vote-panel .section-title-row .badge');
  if(badge)badge.textContent=set.size+' khung giờ';
}
function initScheduleGridDrag(){
  if(document.documentElement.dataset.scheduleGridDragReady==='1')return;
  document.documentElement.dataset.scheduleGridDragReady='1';
  let drag=null;

  // Click đơn lẻ được xử lý bởi bộ định tuyến click hiện có.
  // Chỉ chuyển sang chế độ kéo khi con trỏ thực sự đi sang ô khác.
  document.addEventListener('pointerdown',function(e){
    const button=e.target.closest('.schedule-slot[data-slot]');
    if(!button || e.button!==0 || (e.pointerType==='mouse' && e.button!==0))return;
    drag={
      pointerId:e.pointerId,
      startKey:button.dataset.slot,
      lastKey:button.dataset.slot,
      desired:!button.classList.contains('selected'),
      moved:false,
      pointerType:e.pointerType||'mouse'
    };
  },{passive:true});

  function applyDragTarget(target,e){
    if(!drag || !target || !target.matches('.schedule-slot[data-slot]'))return;
    if(e && e.pointerId!==undefined && e.pointerId!==drag.pointerId)return;
    const key=target.dataset.slot;
    if(!key || key===drag.lastKey)return;

    drag.moved=true;
    drag.lastKey=key;

    // Khi đã kéo, áp dụng cùng một trạng thái cho từng ô đi qua.
    // Ô đầu tiên cũng được áp dụng tại thời điểm xác nhận thao tác kéo.
    const first=[...document.querySelectorAll('.schedule-slot[data-slot]')]
      .find(el=>el.dataset.slot===drag.startKey);
    if(first)applyScheduleSlotSelection(first,drag.desired);
    applyScheduleSlotSelection(target,drag.desired);
  }

  document.addEventListener('pointermove',function(e){
    if(!drag || e.pointerId!==drag.pointerId)return;
    // elementFromPoint hỗ trợ rê/kéo ổn định hơn pointerover,
    // đặc biệt khi kéo nhanh hoặc trên màn hình cảm ứng.
    const node=document.elementFromPoint(e.clientX,e.clientY);
    const target=node?.closest?.('.schedule-slot[data-slot]');
    if(target)applyDragTarget(target,e);
  },{passive:true});

  // Dự phòng cho trình duyệt phát pointerover nhưng không có pointermove hữu ích.
  document.addEventListener('pointerover',function(e){
    if(!drag || e.pointerId!==drag.pointerId)return;
    const target=e.target.closest('.schedule-slot[data-slot]');
    if(target)applyDragTarget(target,e);
  },{passive:true});

  const endDrag=function(e){
    if(!drag || (e && e.pointerId!==undefined && e.pointerId!==drag.pointerId))return;
    if(drag.moved){
      // Chặn click tổng hợp sau thao tác kéo để không đảo trạng thái ô cuối.
      APP.state.schedulePollSuppressClickUntil=Date.now()+500;
    }
    drag=null;
  };
  document.addEventListener('pointerup',endDrag);
  document.addEventListener('pointercancel',endDrag);
  window.addEventListener('blur',()=>{drag=null;});
}
initScheduleGridDrag();

function renderSchedulePollDetail(host,poll,votes){
  if(!poll){host.innerHTML=emptyState('event_busy','Không tìm thấy sự kiện','Bình chọn này có thể đã bị xóa.');return;}
  const dates=[];let d=scheduleParseDateOnly(poll.startDate),end=scheduleParseDateOnly(poll.endDate);
  if(!d||!end){host.innerHTML=emptyState('event_busy','Ngày bình chọn không hợp lệ','Hãy yêu cầu quản lý kiểm tra lại ngày bắt đầu và ngày kết thúc của sự kiện.');return;}
  for(let n=0;d<=end&&n<61;n++,d.setDate(d.getDate()+1))dates.push(scheduleLocalDateValue(d));
  const times=scheduleTimeSlots(poll.startTime,poll.endTime);
  const ownName=APP.session?.employeeName||APP.session?.username||'';
  const existing=votes.find(v=>String(v.participant||'').toLowerCase()===String(ownName).toLowerCase());
  if(!APP.state.schedulePollSelected) APP.state.schedulePollSelected=new Set(existing?.slots||[]);
  const selected=APP.state.schedulePollSelected;
  const availability={};dates.forEach(date=>times.forEach(time=>availability[date+'|'+time]=0));
  votes.forEach(v=>(v.slots||[]).forEach(key=>{if(availability[key]!==undefined)availability[key]++;}));
  const shareUrl=buildSchedulePollLink(poll.id);
  const invitedMembers=Array.isArray(APP.state.schedulePollInvitedMembers)?APP.state.schedulePollInvitedMembers:[];
  const normalizedName=value=>String(value||'').trim().toLocaleLowerCase('vi');
  const votedNames=new Set(votes.map(v=>normalizedName(v.participant)).filter(Boolean));
  const votedMembers=invitedMembers.filter(member=>votedNames.has(normalizedName(member.name)));
  const notVotedMembers=invitedMembers.filter(member=>!votedNames.has(normalizedName(member.name)));
  const memberListHtml=(members,emptyText,isVoted)=>members.length?members.map(member=>`<div class="poll-progress-person" style="display:grid;grid-template-columns:32px minmax(0,1fr);grid-template-areas:'avatar info' 'avatar status';align-items:center;gap:2px 9px;margin:0 0 7px;padding:9px;border:1px solid #e6ebf3;border-radius:10px;background:#fff;box-sizing:border-box">
    <span class="poll-progress-avatar" style="grid-area:avatar;display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:#e8efff;color:#315fbd;font-size:12px;font-weight:800">${scheduleEsc(String(member.name||'?').trim().charAt(0).toLocaleUpperCase('vi'))}</span>
    <span class="poll-progress-person-info" style="grid-area:info;display:flex;flex-direction:column;gap:3px;min-width:0"><strong style="font-size:11px;line-height:1.35;font-weight:700;color:#26354d;overflow-wrap:anywhere">${scheduleEsc(member.name||'Chưa có tên')}</strong><small style="font-size:10px;line-height:1.3;color:#8190a6">${scheduleEsc(member.employeeCode||'Chưa có mã')}</small></span>
    <span class="poll-progress-person-status ${isVoted?'is-voted':'is-pending'}" style="grid-area:status;justify-self:start;margin-top:2px;padding:3px 7px;border-radius:999px;font-size:9.5px;line-height:1.3;font-weight:700;background:${isVoted?'#e8f8ee':'#fff4dd'};color:${isVoted?'#16834a':'#a66b12'}">${isVoted?'Đã bình chọn':'Chưa bình chọn'}</span>
  </div>`).join(''):`<div class="poll-progress-empty">${scheduleEsc(emptyText)}</div>`;
  host.innerHTML=`
    <div class="schedule-detail-head panel" style="display:grid!important;grid-template-columns:minmax(0,1.2fr) minmax(330px,.9fr)!important;grid-template-areas:'main progress' 'share share'!important;align-items:stretch;gap:18px 20px;padding:20px;box-sizing:border-box;overflow:visible;width:100%;max-width:100%">
      <div class="schedule-detail-main" style="grid-area:main;display:block;min-width:0;align-self:start">
        <button class="btn btn-sm" data-action="schedule-poll-back"><span class="material-symbols-rounded">arrow_back</span>Danh sách</button>
        <div class="schedule-detail-title"><span class="schedule-detail-icon material-symbols-rounded">event_available</span><div><h2>${scheduleEsc(poll.title)}</h2><p>${scheduleEsc(poll.description||'Chọn những khung giờ bạn có thể tham gia.')}</p></div></div>
        <div class="schedule-meta"><span><span class="material-symbols-rounded">calendar_month</span>${scheduleEsc(poll.startDate)} – ${scheduleEsc(poll.endDate)}</span><span><span class="material-symbols-rounded">schedule</span>${scheduleEsc(poll.startTime)} – ${scheduleEsc(poll.endTime)}</span><span><span class="material-symbols-rounded">public</span>${scheduleEsc(poll.timezone||'Asia/Ho_Chi_Minh')}</span></div>
      </div>
      <section class="schedule-progress-strip poll-progress-card" style="grid-area:progress;display:flex;flex-direction:column;align-self:stretch;min-width:0;width:100%;margin:0;padding:16px;border:1px solid #dce5f1;border-radius:14px;background:#f8faff;box-shadow:0 1px 3px rgba(15,23,42,.04);color:#24324b;font-family:inherit;box-sizing:border-box">
        <header class="poll-progress-header" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;min-width:0">
          <div class="poll-progress-title" style="display:flex;align-items:center;gap:10px;min-width:0"><span class="material-symbols-rounded" style="display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border-radius:11px;background:#e8efff;color:#315fbd;font-size:20px">query_stats</span><div style="display:flex;flex-direction:column;gap:3px;min-width:0"><h3 style="margin:0;color:#1e293b;font-size:14px;font-weight:750;line-height:1.3">Tiến độ bình chọn</h3><p style="margin:0;color:#77849a;font-size:11px;line-height:1.35">Theo dõi phản hồi của thành viên được mời</p></div></div>
          <span class="poll-progress-total" style="display:inline-flex;align-items:baseline;gap:2px;flex:0 0 auto;padding:6px 10px;border:1px solid #d6e3ff;border-radius:999px;background:#edf3ff;color:#244da3;font-size:16px;font-weight:800;white-space:nowrap">${votedMembers.length}<small style="font-size:11px;font-weight:650;color:#65789e"> / ${invitedMembers.length}</small></span>
        </header>
        <div class="poll-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${invitedMembers.length}" aria-valuenow="${votedMembers.length}" style="height:8px;width:100%;margin:0 0 14px;overflow:hidden;border-radius:999px;background:#e5eaf2"><span style="display:block;height:100%;width:${invitedMembers.length?Math.round(votedMembers.length/invitedMembers.length*100):0}%;border-radius:inherit;background:linear-gradient(90deg,#4777e8,#7196f5);transition:width .25s ease"></span></div>
        <div class="poll-progress-stats" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 12px">
          <div class="poll-progress-stat is-voted" style="display:flex;align-items:center;gap:10px;min-width:0;padding:11px;border:1px solid #dcefe2;border-radius:11px;background:#fff;box-sizing:border-box"><span class="material-symbols-rounded" style="display:grid;place-items:center;flex:0 0 32px;width:32px;height:32px;border-radius:9px;background:#e8f8ee;color:#16834a;font-size:18px">check_circle</span><div style="display:flex;flex-direction:column;gap:3px;min-width:0"><strong style="font-size:20px;line-height:1.05;color:#1e293b">${votedMembers.length}</strong><span style="font-size:10.5px;line-height:1.35;color:#718096">Đã bình chọn</span></div></div>
          <div class="poll-progress-stat is-pending" style="display:flex;align-items:center;gap:10px;min-width:0;padding:11px;border:1px solid #f3e7c9;border-radius:11px;background:#fff;box-sizing:border-box"><span class="material-symbols-rounded" style="display:grid;place-items:center;flex:0 0 32px;width:32px;height:32px;border-radius:9px;background:#fff4dd;color:#b7791f;font-size:18px">schedule</span><div style="display:flex;flex-direction:column;gap:3px;min-width:0"><strong style="font-size:20px;line-height:1.05;color:#1e293b">${notVotedMembers.length}</strong><span style="font-size:10.5px;line-height:1.35;color:#718096">Chưa bình chọn</span></div></div>
        </div>
        <div class="poll-progress-lists" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">
          <details class="poll-progress-group">
            <summary><span class="material-symbols-rounded">how_to_reg</span><span>Đã bình chọn</span><b>${votedMembers.length}</b></summary>
            <div class="poll-progress-list">${memberListHtml(votedMembers,'Chưa có thành viên nào bình chọn.',true)}</div>
          </details>
          <details class="poll-progress-group">
            <summary><span class="material-symbols-rounded">pending_actions</span><span>Chưa bình chọn</span><b>${notVotedMembers.length}</b></summary>
            <div class="poll-progress-list">${memberListHtml(notVotedMembers,'Tất cả thành viên đã bình chọn.',false)}</div>
          </details>
        </div>
      </section>
      <div class="schedule-share" style="grid-area:share;display:flex;align-items:flex-end;gap:10px;min-width:0;width:100%;margin:0;padding-top:15px;border-top:1px solid #e2e8f0;box-sizing:border-box"><label style="display:flex;flex:1 1 auto;flex-direction:column;gap:7px;min-width:0">Liên kết chia sẻ<input id="schedule-poll-share-url" readonly value="${scheduleEsc(shareUrl)}"></label><button class="btn btn-primary" data-action="schedule-poll-copy-link" data-id="${scheduleEsc(poll.id)}"><span class="material-symbols-rounded">content_copy</span>Sao chép link</button></div>
    </div>
    <div class="schedule-vote-layout">
      <section class="panel schedule-vote-panel"><div class="section-title-row"><div><h2>Đánh dấu thời gian rảnh</h2><small class="muted">Bước 2 · Chọn tất cả các ô phù hợp với lịch của bạn.</small></div><span class="badge badge-green">${selected.size} khung giờ</span></div>
        <label class="schedule-field schedule-voter-name">Tên người tham gia<input id="schedule-poll-participant" maxlength="100" value="${scheduleEsc(existing?.participant||ownName)}" placeholder="Nhập tên của bạn"></label>
        <div class="schedule-grid-wrap" id="schedule-grid-wrap"><table class="schedule-grid"><thead><tr><th class="schedule-period-head">Buổi</th><th>Giờ</th>${dates.map(date=>`<th>${scheduleEsc(scheduleDateLabel(date))}</th>`).join('')}</tr></thead><tbody>${(()=>{let previous='';return times.map((time,index)=>{const period=schedulePeriodForTime(time);const first=period!==previous;previous=period;const span=times.slice(index).findIndex(t=>schedulePeriodForTime(t)!==period);const rowspan=span<0?times.length-index:span;return `<tr>${first?`<th class="schedule-period-cell period-${schedulePeriodKey(period)}" rowspan="${rowspan}">${period}</th>`:''}<th class="schedule-time-cell">${time}</th>${dates.map(date=>{const key=date+'|'+time;const count=availability[key]||0;const isSelected=selected.has(key);return `<td><button type="button" class="schedule-slot ${isSelected?'selected':''} ${count?'has-votes':''}" data-action="schedule-poll-toggle-slot" data-slot="${key}" title="${count} người có thể tham gia">${count?`<span>${count}</span>`:''}</button></td>`}).join('')}</tr>`}).join('')})()}</tbody></table></div>
        <div class="schedule-vote-actions"><span class="muted">Màu đậm = bạn chọn · Số trong ô = số người rảnh</span><button class="btn btn-primary" data-action="schedule-poll-save-vote"><span class="material-symbols-rounded">how_to_vote</span>Lưu lịch của tôi</button></div>
      </section>
      <aside class="schedule-results-column">
        <section class="panel schedule-results"><div class="section-title-row"><h2>Khung giờ phù hợp</h2><span class="badge badge-green">${votes.length} người</span></div><p class="muted">Các khung giờ có nhiều người rảnh được ưu tiên hiển thị trước.</p>
        ${Object.entries(availability).filter(([,count])=>count>0).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([key,count])=>{const parts=key.split('|');return `<div class="schedule-result-row"><div><strong>${scheduleEsc(scheduleDateLabel(parts[0]))}</strong><small>${scheduleEsc(parts[1])}–${scheduleEsc(scheduleTimeSlots(parts[1],times[times.indexOf(parts[1])+1]||poll.endTime)[0]||parts[1])}</small></div><div class="schedule-result-bar"><span style="width:${Math.round(count/Math.max(1,votes.length)*100)}%"></span></div><b>${count}/${votes.length}</b></div>`}).join('')||'<div class="schedule-no-results">Chưa có ai gửi lịch. Hãy chọn khung giờ và lưu bình chọn đầu tiên.</div>'}
        </section>
      </aside>
    </div>`;
}
function buildSchedulePollLink(id){
  const base=String(APP.state.schedulePollBaseUrl||window.location.href||'').split('?')[0].split('#')[0];
  return base+'?page=schedule-polls&poll='+encodeURIComponent(id);
}
function openSchedulePoll(id){APP.state.schedulePollId=String(id||'');renderSchedulePolls();}
function toggleScheduleSlot(key){
  const button=[...document.querySelectorAll('.schedule-slot[data-slot]')].find(el=>el.dataset.slot===key);
  if(!button)return;
  const set=APP.state.schedulePollSelected||(APP.state.schedulePollSelected=new Set());
  applyScheduleSlotSelection(button,!set.has(key));
}
function schedulePollInviteEmployees(){
  const employees=(APP.data.employees||[]).filter(e=>String(e['Mã nhân sự']||'').trim());
  const role=String(APP.session?.role||'');
  if(role!=='Quản lý') return employees.sort((a,b)=>String(a['Họ và tên']||'').localeCompare(String(b['Họ và tên']||''),'vi'));
  const managerId=String(APP.session?.employeeId||'').trim();
  const byManager=new Map();
  employees.forEach(e=>{
    const manager=String(e['Mã quản lý trực tiếp']||'').trim();
    if(!byManager.has(manager))byManager.set(manager,[]);
    byManager.get(manager).push(String(e['Mã nhân sự']||'').trim());
  });
  const allowed=new Set(managerId?[managerId]:[]),queue=managerId?[managerId]:[];
  while(queue.length){
    const current=queue.shift();
    (byManager.get(current)||[]).forEach(id=>{if(id&&!allowed.has(id)){allowed.add(id);queue.push(id);}});
  }
  return employees.filter(e=>allowed.has(String(e['Mã nhân sự']||'').trim()))
    .sort((a,b)=>String(a['Họ và tên']||'').localeCompare(String(b['Họ và tên']||''),'vi'));
}
function setSchedulePollInviteSelection(checked){
  // Chọn/bỏ chọn toàn bộ danh sách được phép mời, kể cả những dòng đang bị ẩn bởi tìm kiếm.
  document.querySelectorAll('#schedule-poll-member-list input.schedule-poll-member-check')
    .forEach(input=>{input.checked=Boolean(checked);});
  syncSchedulePollInviteSelectAll();
}
function syncSchedulePollInviteSelectAll(){
  const all=[...document.querySelectorAll('#schedule-poll-member-list input.schedule-poll-member-check')];
  const checked=all.filter(input=>input.checked).length;
  const master=document.getElementById('schedule-poll-select-all-checkbox');
  if(master){master.checked=all.length>0&&checked===all.length;master.indeterminate=checked>0&&checked<all.length;}
  const count=document.getElementById('schedule-poll-member-count');
  if(count)count.textContent=`${checked}/${all.length} thành viên đã chọn`;
}
function selectedSchedulePollMembers(){
  return [...document.querySelectorAll('#schedule-poll-member-list input.schedule-poll-member-check:checked')]
    .map(input=>String(input.value||'').trim()).filter(Boolean);
}
async function createSchedulePollFromForm(){
  const value=id=>document.getElementById(id)?.value||'';
  const payload={title:value('schedule-poll-title').trim(),description:value('schedule-poll-description').trim(),startDate:value('schedule-poll-start'),endDate:value('schedule-poll-end'),startTime:value('schedule-poll-time-start'),endTime:value('schedule-poll-time-end'),timezone:value('schedule-poll-timezone')||'Asia/Ho_Chi_Minh',invitedEmployeeIds:selectedSchedulePollMembers()};
  if(!payload.title){showToast('Thiếu tên sự kiện','Vui lòng nhập tên sự kiện cần bình chọn.','warning');return;}
  if(!payload.startDate||!payload.endDate||payload.endDate<payload.startDate){showToast('Khoảng ngày chưa hợp lệ','Ngày kết thúc phải từ ngày bắt đầu trở đi.','warning');return;}
  if(payload.startTime>=payload.endTime){showToast('Khung giờ chưa hợp lệ','Giờ kết thúc phải sau giờ bắt đầu.','warning');return;}
  if(!payload.invitedEmployeeIds.length){showToast('Chưa chọn thành viên','Hãy chọn ít nhất một thành viên được phép xem và bình chọn.','warning');return;}
  try{
    const result=await gas('createSchedulePoll',APP.token,payload,{timeout:30000});
    APP.state.schedulePollId=result.id;
    showToast('Đã tạo bình chọn','Chia sẻ liên kết để mọi người đánh dấu lịch rảnh.','success');
    renderSchedulePolls();
  }catch(err){
    const message=String(err?.message||'Lỗi máy chủ.');
    showToast('Không thể tạo bình chọn',message,'error',6000);
    if(/mã nhân sự|thành viên hợp lệ|tải lại danh sách/i.test(message)){
      // Làm mới giao diện form để người dùng có thể kiểm tra lại danh sách nhân sự.
      const list=document.getElementById('schedule-poll-member-list');
      if(list)list.scrollIntoView({behavior:'smooth',block:'center'});
    }
  }
}
async function saveScheduleVoteFromPage(){
  const participant=String(document.getElementById('schedule-poll-participant')?.value||'').trim();
  if(!participant){showToast('Thiếu tên','Vui lòng nhập tên người tham gia.','warning');return;}
  const slots=[...(APP.state.schedulePollSelected||new Set())];
  if(!slots.length){showToast('Chưa chọn khung giờ','Hãy chọn ít nhất một ô thời gian rảnh.','warning');return;}
  try{
    await gas('saveScheduleVote',APP.token,APP.state.schedulePoll.id,participant,slots,{timeout:30000});
    showToast('Đã lưu bình chọn','Lịch rảnh của bạn đã được cập nhật.','success');
    await loadSchedulePollPage(APP.state.schedulePoll.id);
  }catch(err){showToast('Không lưu được bình chọn',err.message||'Lỗi máy chủ.','error',5000);}
}
function copySchedulePollLink(id){
  const url=buildSchedulePollLink(id);
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(()=>showToast('Đã sao chép liên kết','Gửi liên kết cho các thành viên trong nhóm.','success')).catch(()=>prompt('Sao chép liên kết bình chọn:',url));
  else prompt('Sao chép liên kết bình chọn:',url);
}

function renderHelp(){
  const steps=[['1','Thiết lập Danh mục','Khai báo Nhóm, Chức vụ, Loại dự án, Nhóm công việc, Nhóm KPI, Đơn vị tính và Loại tài liệu.','categories'],['2','Tạo hồ sơ Nhân sự','Nhập nhân sự và quản lý trực tiếp trước khi giao việc hoặc tạo tài khoản.','employees'],['3','Tạo Dự án nội bộ','Chọn một người phụ trách chính và các thành viên tham gia dự án.','projects'],['4','Giao Công việc','Mỗi công việc có một người chịu trách nhiệm chính và có thể có nhiều người phối hợp.','tasks'],['5','Theo dõi & xác nhận','Nhóm chuyển Chờ xác nhận; quản lý kiểm tra rồi xác nhận Hoàn thành.','action-center'],['6','Đánh giá & chốt KPI','KPI tự động lấy dữ liệu công việc, quản lý đánh giá phần thủ công và chốt cuối kỳ.','kpi-evaluation']].filter(x=>canAccessPageByRole(x[3]));
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Hướng dẫn sử dụng','Thực hiện theo thứ tự để dữ liệu liên kết chính xác ngay từ lần đầu.')}<div class="help-flow">${steps.map(([n,t,p,page])=>`<div class="panel help-step"><div class="help-step-number">${n}</div><h3>${t}</h3><p>${p}</p><button class="btn btn-sm" data-action="help-go" data-page="${page}">Mở chức năng <span class="material-symbols-rounded">arrow_forward</span></button></div>`).join('')}</div><div class="help-accordion">${helpItem('Cách giao nhiều công việc','Tại Công việc, bấm Giao công việc. Bước Nhập thông tin cho phép thêm 1 hoặc 5 dòng, xóa dòng trống, mở rộng từng dòng để chọn người tham gia và đính kèm file. Bước Kiểm tra sẽ chỉ rõ dòng hợp lệ hoặc cần sửa trước khi lưu.')}${helpItem('Luồng xác nhận công việc','Nhóm cập nhật tiến độ và khi hoàn tất chuyển sang Chờ xác nhận. Quản lý mở Việc cần xử lý, kiểm tra kết quả và chọn Xác nhận hoàn thành hoặc Trả lại. Chỉ trạng thái Hoàn thành sau xác nhận mới được tính là hoàn thành chính thức.')}${helpItem('Import và Export XLSX','Tải mẫu Import để có đúng tên cột và danh sách chọn. Khi chọn file, hệ thống chỉ đọc và kiểm tra trước, chưa lưu ngay. Chỉ các dòng hợp lệ mới được gửi lên database sau khi xác nhận.')}${helpItem('Upload và xem tài liệu','File được giữ trên máy cho đến khi bấm Lưu/Upload. File đã lưu chỉ tải nội dung khi bấm Xem. Ảnh, PDF và text nhỏ được xem trực tiếp; Word, Excel hoặc file lớn dùng nút Mở trên Drive/Tải xuống.')}${helpItem('Báo cáo PDF','Báo cáo PDF được dựng riêng theo khổ A4 với tiêu đề, kỳ báo cáo, KPI chính, bảng dữ liệu và biểu đồ. Đây không phải ảnh chụp giao diện Dashboard.')}${helpItem('Lưu ý khi dùng Google Sheet','Không đổi tên tab, tiêu đề cột, chèn cột vào giữa hoặc sửa mã hệ thống. Sau khi chỉnh dữ liệu trực tiếp trên Google Sheet, quay lại web app và bấm Làm mới.')}</div></div>`;
}
function helpItem(title,content){return `<div class="help-item"><button data-action="toggle-help"><span>${escapeHtml(title)}</span><span class="material-symbols-rounded">expand_more</span></button><div class="help-item-content hidden">${escapeHtml(content)}</div></div>`;}

/* ========================= MODAL HELPERS ========================= */
function openModal(html){
  const root=document.getElementById('modal-root');
  if(!root)return;
  root.innerHTML=`<div class="modal-overlay">${html}</div>`;
  requestAnimationFrame(()=>{
    bindComboboxes(root);
    initRichTextEditors(root);
    applyPermissions();
    if(typeof initLazyEmployeeAvatars==='function')initLazyEmployeeAvatars(root);
  });
}
function closeModal(){document.getElementById('modal-root').innerHTML='';APP.state.pendingFiles=[];APP.state.wizard=null;APP.state.templateDraftDetails=null;closeComboMenu();}
function modalShell(title,subtitle,body,footer,size=''){return `<div class="modal ${size}"><div class="modal-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle||'')}</p></div><button class="modal-close" data-action="close-modal"><span class="material-symbols-rounded">close</span></button></div><div class="modal-body">${body}</div><div class="modal-footer">${footer}</div></div>`;}
function formField(module,field,inputHtml,hint='',full=false,required=false){const tip=getFieldTooltip(module,field);return `<div class="form-field ${full?'full':''}"><label>${escapeHtml(field)}${required?'<span class="required">*</span>':''}${tip?tooltipIcon(tip):''}</label>${inputHtml}<div class="field-help">${escapeHtml(hint||tip||'Nhập thông tin phù hợp với hồ sơ này.')}</div></div>`;}
function textInput(field,value='',placeholder='',type='text',attrs=''){return `<input data-field="${escapeAttr(field)}" type="${type}" value="${escapeAttr(value??'')}" placeholder="${escapeAttr(placeholder)}" ${attrs}>`;}
function textArea(field,value='',placeholder=''){return `<textarea data-field="${escapeAttr(field)}" placeholder="${escapeAttr(placeholder)}">${escapeHtml(value??'')}</textarea>`;}
/* Rich text editor kiểu Word cho các ô nhập nhiều dòng. Nội dung vẫn đồng bộ về textarea gốc để tương thích với luồng lưu hiện tại. */
function initRichTextEditors(scope=document){
  if(!scope||!scope.querySelectorAll)return;
  const areas=[...scope.querySelectorAll('textarea:not([data-rich-ready])')];
  areas.forEach(area=>{
    if(area.closest('.rich-editor'))return;
    area.dataset.richReady='1';
    const initial=String(area.value||'');
    // Textarea nằm trong <label> sẽ khiến click vào vùng contenteditable bị label
    // chuyển focus ngược về textarea ẩn. Đổi label bao ngoài thành div nhưng giữ nguyên
    // class/nội dung để giữ bố cục và tránh mất khả năng nhập.
    const outerLabel=area.closest('label.form-field, label.field');
    if(outerLabel && outerLabel.contains(area)){
      const field=document.createElement('div');
      [...outerLabel.attributes].forEach(attr=>field.setAttribute(attr.name,attr.value));
      while(outerLabel.firstChild)field.appendChild(outerLabel.firstChild);
      outerLabel.replaceWith(field);
    }
    const wrapper=document.createElement('div'); wrapper.className='rich-editor';
    const toolbar=document.createElement('div'); toolbar.className='rich-toolbar'; toolbar.setAttribute('role','toolbar'); toolbar.setAttribute('aria-label','Công cụ định dạng văn bản');
    toolbar.innerHTML=[
      '<div class="rich-tool-group rich-font-group"><div class="rich-tool-row">',
      '<select data-rich-font class="rich-font-family" title="Phông chữ"><option value="Arial">Arial</option><option value="Times New Roman" selected>Times New Roman</option><option value="Calibri">Calibri</option><option value="Georgia">Georgia</option><option value="Verdana">Verdana</option></select>',
      '<select data-rich-size class="rich-font-size" title="Cỡ chữ"><option value="1">8</option><option value="2">10</option><option value="3" selected>12</option><option value="4">14</option><option value="5">18</option><option value="6">24</option><option value="7">36</option></select>',
      '<button type="button" data-rich-command="bold" title="In đậm (Ctrl+B)" class="rich-icon-btn"><b>B</b></button>',
      '<button type="button" data-rich-command="italic" title="In nghiêng (Ctrl+I)" class="rich-icon-btn"><i>I</i></button>',
      '<button type="button" data-rich-command="underline" title="Gạch chân (Ctrl+U)" class="rich-icon-btn"><u>U</u></button>',
      '<button type="button" data-rich-command="strikeThrough" title="Gạch ngang" class="rich-icon-btn"><s>ab</s></button>',
      '<button type="button" data-rich-command="subscript" title="Chỉ số dưới" class="rich-icon-btn">x₂</button>',
      '<button type="button" data-rich-command="superscript" title="Chỉ số trên" class="rich-icon-btn">x²</button>',
      '<span class="rich-toolbar-sep"></span>',
      '<label class="rich-color" title="Màu chữ"><span class="rich-color-letter">A</span><input type="color" data-rich-color value="#17233d" aria-label="Màu chữ"></label>',
      '<label class="rich-color rich-highlight" title="Màu đánh dấu"><span>▰</span><input type="color" data-rich-highlight value="#fff176" aria-label="Màu đánh dấu"></label>',
      '<button type="button" data-rich-command="removeFormat" title="Xóa định dạng" class="rich-icon-btn">A<span class="rich-eraser">⌫</span></button>',
      '</div><div class="rich-tool-caption">Phông chữ</div></div>',
      '<span class="rich-toolbar-divider"></span>',
      '<div class="rich-tool-group rich-paragraph-group"><div class="rich-tool-row">',
      '<button type="button" data-rich-command="insertUnorderedList" title="Danh sách dấu đầu dòng" class="rich-icon-btn rich-list-icon">• ☷</button>',
      '<button type="button" data-rich-command="insertOrderedList" title="Danh sách đánh số" class="rich-icon-btn rich-list-icon">1. ☷</button>',
      '<button type="button" data-rich-command="outdent" title="Giảm thụt lề" class="rich-icon-btn">⇤</button>',
      '<button type="button" data-rich-command="indent" title="Tăng thụt lề" class="rich-icon-btn">⇥</button>',
      '<span class="rich-toolbar-sep"></span>',
      '<button type="button" data-rich-command="justifyLeft" title="Căn trái" class="rich-icon-btn">☰</button>',
      '<button type="button" data-rich-command="justifyCenter" title="Căn giữa" class="rich-icon-btn">≡</button>',
      '<button type="button" data-rich-command="justifyRight" title="Căn phải" class="rich-icon-btn">☷</button>',
      '<button type="button" data-rich-command="justifyFull" title="Căn đều hai bên" class="rich-icon-btn">☰</button>',
      '<select data-rich-block title="Kiểu đoạn" class="rich-block-select"><option value="P">Văn bản thường</option><option value="H2">Tiêu đề 2</option><option value="H3">Tiêu đề 3</option><option value="BLOCKQUOTE">Trích dẫn</option></select>',
      '<button type="button" data-rich-insert-table title="Chèn bảng" class="rich-icon-btn rich-table-btn">▦ Bảng</button>',
      '<button type="button" data-rich-command="insertHorizontalRule" title="Chèn đường kẻ" class="rich-icon-btn">―</button>',
      '</div><div class="rich-tool-caption">Đoạn văn</div></div>'
    ].join('');
    const editor=document.createElement('div'); editor.className='rich-editable'; editor.setAttribute('contenteditable','true');
    editor.setAttribute('role','textbox'); editor.setAttribute('aria-multiline','true'); editor.setAttribute('spellcheck','true');
    editor.tabIndex=0;
    editor.setAttribute('data-placeholder',area.getAttribute('placeholder')||'Nhập nội dung...');
    editor.innerHTML=initial ? safeRichHtml(initial) : '';
    area.classList.add('rich-source'); area.setAttribute('aria-hidden','true'); area.tabIndex=-1;
    area.insertAdjacentElement('afterend',wrapper); wrapper.append(toolbar,editor);
    let savedRange=null;
    const saveSelection=()=>{const sel=window.getSelection();if(sel&&sel.rangeCount&&editor.contains(sel.anchorNode)){savedRange=sel.getRangeAt(0).cloneRange();}};
    const restoreSelection=()=>{
      editor.focus({preventScroll:true});
      const sel=window.getSelection();
      if(savedRange&&sel){try{sel.removeAllRanges();sel.addRange(savedRange);}catch(_e){}}
      else if(sel){const r=document.createRange();r.selectNodeContents(editor);r.collapse(false);sel.removeAllRanges();sel.addRange(r);}
    };
    const sync=()=>{area.value=editor.innerHTML;area.dispatchEvent(new Event('input',{bubbles:true}));};
    editor.addEventListener('keyup',saveSelection); editor.addEventListener('mouseup',saveSelection); editor.addEventListener('input',()=>{saveSelection();sync();});
    editor.addEventListener('blur',sync);
    document.addEventListener('selectionchange',()=>{const sel=window.getSelection();if(sel&&sel.rangeCount&&editor.contains(sel.anchorNode))saveSelection();});
    // Lưu vùng chọn trước khi chuyển sang thanh công cụ. Nút định dạng không được cướp
    // focus; các select chỉ lưu vùng chọn rồi mở bình thường để người dùng chọn mục.
    toolbar.addEventListener('mousedown',e=>{
      if(e.target.closest('button,[data-rich-font],[data-rich-size],[data-rich-block],[data-rich-color],[data-rich-highlight]')){
        saveSelection();
        if(e.target.closest('button'))e.preventDefault();
      }
    });
    toolbar.addEventListener('click',e=>{
      const tableBtn=e.target.closest('[data-rich-insert-table]');
      if(tableBtn){
        saveSelection();
        const oldPanel=wrapper.querySelector('.rich-table-popover');
        if(oldPanel){oldPanel.remove();return;}
        const panel=document.createElement('div'); panel.className='rich-table-popover';
        panel.innerHTML='<div class="rich-table-popover-title">Chèn bảng</div><div class="rich-table-fields"><label>Số hàng<input type="number" data-table-rows min="1" max="20" value="3"></label><label>Số cột<input type="number" data-table-cols min="1" max="10" value="3"></label></div><div class="rich-table-popover-actions"><button type="button" data-table-cancel class="rich-table-cancel">Hủy</button><button type="button" data-table-insert class="rich-table-confirm">Chèn bảng</button></div>';
        toolbar.appendChild(panel);
        panel.querySelector('[data-table-rows]').focus();
        return;
      }
      const cancelTable=e.target.closest('[data-table-cancel]');
      if(cancelTable){wrapper.querySelector('.rich-table-popover')?.remove();return;}
      const insertTable=e.target.closest('[data-table-insert]');
      if(insertTable){
        const panel=wrapper.querySelector('.rich-table-popover');
        const rows=Math.max(1,Math.min(20,parseInt(panel?.querySelector('[data-table-rows]')?.value,10)||3));
        const cols=Math.max(1,Math.min(10,parseInt(panel?.querySelector('[data-table-cols]')?.value,10)||3));
        restoreSelection();
        let html='<table class="rich-content-table" style="width:100%;border-collapse:collapse;table-layout:auto"><tbody>';
        for(let r=0;r<rows;r++){html+='<tr>';for(let c=0;c<cols;c++){const tag=r===0?'th':'td';html+='<'+tag+' style="border:1px solid #98a2b3;padding:7px 9px;vertical-align:top;min-width:48px;'+(r===0?'background-color:#eef2f7;font-weight:700;':'')+'">'+(r===0?'Tiêu đề':'<br>')+'</'+tag+'>'; }html+='</tr>';}
        html+='</tbody></table><p><br></p>';
        document.execCommand('insertHTML',false,html); panel?.remove(); saveSelection();sync();return;
      }
      const btn=e.target.closest('[data-rich-command]'); if(btn){restoreSelection();document.execCommand(btn.dataset.richCommand,false,null);saveSelection();sync();return;}
    });
    // Dán nội dung từ Word/Excel/Google Docs: giữ bảng, màu nền, màu chữ, đường viền,
    // căn chỉnh và các định dạng cơ bản, đồng thời loại bỏ script/thuộc tính nguy hiểm.
    editor.addEventListener('paste',e=>{
      const clipboard=e.clipboardData; if(!clipboard)return;
      const html=clipboard.getData('text/html');
      if(html && /<(?:table|tr|td|th|strong|b|i|em|u|span|p|div)\b/i.test(html)){
        e.preventDefault();
        const clean=safeRichHtml(html);
        document.execCommand('insertHTML',false,clean);
        saveSelection();sync();
      }
    });
    toolbar.addEventListener('change',e=>{
      const el=e.target;
      if(el.matches('[data-rich-font],[data-rich-size],[data-rich-block]')){
        restoreSelection();
        if(el.matches('[data-rich-font]'))document.execCommand('fontName',false,el.value);
        else if(el.matches('[data-rich-size]'))document.execCommand('fontSize',false,el.value);
        else document.execCommand('formatBlock',false,el.value);
        saveSelection();sync();
      }
    });
    toolbar.addEventListener('input',e=>{
      const el=e.target;
      if(el.matches('[data-rich-color],[data-rich-highlight]')){
        restoreSelection();
        document.execCommand(el.matches('[data-rich-color]')?'foreColor':'hiliteColor',false,el.value);
        saveSelection();sync();
      }
    });
    editor.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['b','i','u'].includes(e.key.toLowerCase())){e.preventDefault();document.execCommand(({b:'bold',i:'italic',u:'underline'})[e.key.toLowerCase()],false,null);saveSelection();sync();}});
    // Tránh trường hợp submit/lưu khi nội dung mới chỉ nằm trong vùng soạn thảo.
    const form=area.closest('form'); if(form)form.addEventListener('submit',sync);
  });
}
/* Hiển thị nội dung rich-text đồng nhất cho mọi hồ sơ; nội dung cũ dạng HTML không bị in ra như mã nguồn. */
(function ensureTaskRichContentStyles(){
  if(document.getElementById('task-rich-content-styles')) return;
  const style=document.createElement('style');
  style.id='task-rich-content-styles';
  style.textContent=`
    .task-rich-content,.project-rich-description{white-space:normal;overflow-wrap:anywhere;line-height:1.7;min-width:0}
    .task-rich-content + .task-rich-content{margin-top:10px}
    .task-rich-content p,.project-rich-description p{margin:0 0 8px}
    .task-rich-content p:last-child,.project-rich-description p:last-child{margin-bottom:0}
    .task-rich-content ul,.task-rich-content ol,.project-rich-description ul,.project-rich-description ol{padding-left:24px;margin:6px 0}
    .task-rich-content table,.project-rich-description table{border-collapse:collapse;max-width:100%;width:100%;overflow-wrap:anywhere}
    .task-rich-content td,.task-rich-content th,.project-rich-description td,.project-rich-description th{border:1px solid var(--border,#d9e0ea);padding:6px 8px;vertical-align:top}
    .task-rich-content a,.project-rich-description a{color:var(--primary,#16a34a);text-decoration:underline;overflow-wrap:anywhere}
    .task-rich-content img,.project-rich-description img{max-width:100%;height:auto}
    .task-rich-note{padding-top:8px;border-top:1px solid var(--border,#e5e7eb);color:var(--muted)}
  `;
  document.head.appendChild(style);
})();
function safeRichHtml(value){
  let raw=String(value??'').replace(/<!--\s*(?:StartFragment|EndFragment)\s*-->/gi,'').replace(/<meta\b[^>]*>/gi,'');
  if(!raw.trim())return '';

  // Một số dữ liệu cũ được lưu dưới dạng HTML đã escape (&lt;div...&gt;).
  // Chỉ giải mã khi toàn bộ nội dung có dấu hiệu là một đoạn HTML được mã hóa.
  if(/^\s*&lt;\/?(?:div|p|span|strong|b|ul|ol|table|a|h[1-6])\b/i.test(raw)){
    const decoder=document.createElement('textarea');
    decoder.innerHTML=raw;
    raw=decoder.value;
  }

  // Văn bản thuần: escape trước khi đưa vào DOM và giữ nguyên xuống dòng.
  const hasMarkup=/<\/?(?:a|b|strong|i|em|u|s|strike|sub|sup|ul|ol|li|p|div|br|h[1-6]|blockquote|span|font|table|thead|tbody|tfoot|tr|td|th|colgroup|col|img)\b/i.test(raw);
  if(!hasMarkup)return escapeHtml(raw).replace(/\r?\n/g,'<br>');

  const box=document.createElement('div');
  box.innerHTML=raw;
  const allowed=new Set(['B','STRONG','I','EM','U','S','STRIKE','SUB','SUP','UL','OL','LI','P','DIV','BR','H1','H2','H3','H4','H5','H6','BLOCKQUOTE','SPAN','FONT','TABLE','THEAD','TBODY','TFOOT','TR','TD','TH','COLGROUP','COL','A','IMG']);
  const safeStyles=new Set(['color','background','background-color','font-family','font-size','font-weight','font-style','text-decoration','text-align','vertical-align','border','border-top','border-right','border-bottom','border-left','border-color','border-width','border-style','border-collapse','border-spacing','padding','padding-top','padding-right','padding-bottom','padding-left','margin','margin-top','margin-right','margin-bottom','margin-left','width','min-width','max-width','height','white-space','table-layout','display','line-height']);
  const safeValue=v=>!/(?:url\s*\(|expression\s*\(|javascript\s*:|vbscript\s*:|behavior\s*:|-moz-binding)/i.test(v) && !/[<>]/.test(v);
  const safeUrl=(value, image=false)=>{
    try{
      const u=new URL(String(value||''),location.href);
      if(['http:','https:'].includes(u.protocol))return u.href;
      if(!image&&u.protocol==='mailto:')return u.href;
      if(image&&/^data:image\/(?:png|jpeg|jpg|gif|webp);base64,/i.test(String(value||'')))return String(value);
    }catch(_e){}
    return '';
  };
  const walk=node=>{
    [...node.childNodes].forEach(child=>{
      if(child.nodeType===Node.COMMENT_NODE){child.remove();return;}
      if(child.nodeType!==Node.ELEMENT_NODE){if(child.nodeType!==Node.TEXT_NODE)child.remove();return;}
      if(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','FORM','INPUT','BUTTON','LINK','META'].includes(child.tagName)){child.remove();return;}
      if(!allowed.has(child.tagName)){
        const parent=child.parentNode;
        const moved=[...child.childNodes];
        moved.forEach(n=>parent.insertBefore(n,child));
        child.remove();
        moved.forEach(n=>{if(n.nodeType===Node.ELEMENT_NODE)walk(n);});
        return;
      }
      [...child.attributes].forEach(attr=>{
        const name=attr.name.toLowerCase(), val=attr.value.trim();
        if(name==='style'){
          const declarations=[];
          val.split(';').forEach(part=>{
            const i=part.indexOf(':');if(i<1)return;
            const prop=part.slice(0,i).trim().toLowerCase(),v=part.slice(i+1).trim();
            if(!safeStyles.has(prop)||!safeValue(v))return;
            declarations.push(prop+':'+v);
          });
          if(declarations.length)child.setAttribute('style',declarations.join(';'));else child.removeAttribute('style');
        }else if(child.tagName==='A'&&name==='href'){
          const url=safeUrl(val,false);if(url)child.setAttribute('href',url);else child.removeAttribute('href');
        }else if(child.tagName==='A'&&name==='target'){
          if(val==='_blank')child.setAttribute('rel','noopener noreferrer');else child.removeAttribute('target');
        }else if(child.tagName==='A'&&name==='rel'){
          child.setAttribute('rel','noopener noreferrer');
        }else if(child.tagName==='IMG'&&name==='src'){
          const url=safeUrl(val,true);if(url)child.setAttribute('src',url);else child.removeAttribute('src');
        }else if(child.tagName==='IMG'&&name==='alt'){
          child.setAttribute('alt',val.slice(0,300));
        }else if(['colspan','rowspan'].includes(name)&&['TD','TH'].includes(child.tagName)){
          const n=parseInt(val,10);if(Number.isInteger(n)&&n>=1&&n<=50)child.setAttribute(name,String(n));else child.removeAttribute(name);
        }else if(['width','height','border','cellpadding','cellspacing'].includes(name)&&['TABLE','TD','TH','COL','COLGROUP','IMG'].includes(child.tagName)){
          if(/^\d{1,4}(?:%|px)?$/.test(val))child.setAttribute(name,val);else child.removeAttribute(name);
        }else if(child.tagName==='FONT'&&['color','face','size'].includes(name)){
          if(/[<>"']/.test(val))child.removeAttribute(name);
        }else if(child.tagName==='TABLE'&&name==='class'){
          child.setAttribute('class','rich-content-table');
        }else child.removeAttribute(name);
      });
      walk(child);
    });
  };
  walk(box);
  return box.innerHTML;
}
function comboHtml(field,value,options,placeholder='Tìm kiếm và chọn...',displayOverride=''){const normalized=(options||[]).map(o=>typeof o==='string'?{value:o,label:o}:o);const selected=normalized.find(o=>String(o.value)===String(value));const display=displayOverride||selected?.label||value||'';return `<div class="combo" data-combo-field="${escapeAttr(field)}"><div class="combo-control"><input class="combo-display" value="${escapeAttr(display)}" placeholder="${escapeAttr(placeholder)}" autocomplete="off"><button class="combo-arrow" type="button"><span class="material-symbols-rounded">expand_more</span></button></div><input type="hidden" data-field="${escapeAttr(field)}" value="${escapeAttr(value||'')}"><div class="combo-source hidden">${normalized.map(o=>`<span data-value="${escapeAttr(o.value)}" data-label="${escapeAttr(o.label)}"></span>`).join('')}</div></div>`;}
function personOptions(filterFn){return (APP.data.employees||[]).filter(filterFn||(()=>true)).map(e=>({value:e['Mã nhân sự'],label:`${e['Mã nhân sự']} - ${e['Họ và tên']}`}));}
function projectOptions(){return (APP.data.projects||[]).map(p=>({value:p['Mã dự án'],label:`${p['Mã dự án']} - ${p['Tên dự án']}`}));}
function activeTeamOptions(){
  const teams=Array.isArray(APP.data?.teams)?APP.data.teams:(APP.state.teams||[]);
  return teams.filter(t=>String(t.status||'Hoạt động')==='Hoạt động').map(t=>({value:t.name,label:t.name}));
}
function categoryOptions(group){
  if(group==='Nhóm')return activeTeamOptions();
  return (APP.data.categories?.[group]||[]).map(v=>({value:v,label:v}));
}
function fixedOptions(key){return (APP.data.fixedOptions?.[key]||[]).map(v=>({value:v,label:v}));}
function collectForm(root=document.getElementById('modal-root')){const out={};root.querySelectorAll('[data-field]').forEach(el=>{if(el.type==='checkbox')out[el.dataset.field]=el.checked;else out[el.dataset.field]=el.value;});return out;}
function bindComboboxes(){/* Event delegation handles comboboxes. */}

/* ========================= EMPLOYEE MODAL ========================= */
function openEmployeeModal(id=''){
  const r=id?(APP.data.employees||[]).find(x=>x['Mã nhân sự']===id):{};APP.state.pendingFiles=[];
  const body=`<div class="form-grid">
    ${id?formField('employees','Mã nhân sự',textInput('Mã nhân sự',r['Mã nhân sự'],'Tự sinh','text','readonly'),'Mã do hệ thống tự sinh và không thay đổi.',false,false):''}
    ${formField('employees','Họ và tên',textInput('Họ và tên',r['Họ và tên'],'Ví dụ: Nguyễn Văn An'),'Tên hiển thị trong toàn bộ hệ thống.',false,true)}
    ${formField('employees','Nhóm',comboHtml('Nhóm',r['Nhóm'],activeTeamOptions(),'Chọn đội/nhóm đang hoạt động...'),'Lấy từ danh sách Đội/Nhóm đang hoạt động.',false,true)}
    ${formField('employees','Chức vụ',comboHtml('Chức vụ',r['Chức vụ'],categoryOptions('Chức vụ'),'Tìm chức vụ...'),'Lấy từ module Danh mục.',false,true)}
    ${formField('employees','Mã quản lý trực tiếp',comboHtml('Mã quản lý trực tiếp',r['Mã quản lý trực tiếp'],personOptions(e=>e['Mã nhân sự']!==id),'Tìm mã hoặc tên quản lý...'),'Dùng để xác định đội nhóm và quyền đánh giá KPI.')}
    ${formField('employees','Email',textInput('Email',r['Email'],'ten@congty.vn','email'),'Nhập email đúng định dạng.')}
    ${formField('employees','Số điện thoại',textInput('Số điện thoại',formatPhoneRaw(r['Số điện thoại']),'0901234567','text','inputmode="numeric"'),'Giữ nguyên số 0 đầu.')}
    ${formField('employees','Ngày tháng năm sinh',textInput('Ngày tháng năm sinh',toDateInput(r['Ngày tháng năm sinh']),'','date'),'Ngày bắt đầu làm việc tại công ty.')}
    ${formField('employees','Trạng thái',comboHtml('Trạng thái',r['Trạng thái']||'Đang làm',['Đang làm','Tạm nghỉ','Đã nghỉ'],'Chọn trạng thái'),'Trạng thái nhân sự hiện tại.',false,true)}
    ${formField('employees','Ghi chú',textArea('Ghi chú',r['Ghi chú'],'Thông tin bổ sung...'),'Không ảnh hưởng báo cáo.',true)}
  </div>`;
  openModal(modalShell(id?'Cập nhật nhân sự':'Thêm nhân sự','Nhập thông tin hồ sơ nhân sự. Các trường liên kết dùng ô tìm kiếm và chọn.',body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-employee"><span class="material-symbols-rounded">save</span>Lưu nhân sự</button>`,'wide'));
}
async function saveEmployeeModal(){
  const data=collectForm();
  data['Số điện thoại']=normalizePhoneForSave(data['Số điện thoại']);
  const t=showToast('Đang lưu nhân sự','Dữ liệu đang được kiểm tra và cập nhật.','processing',0);
  forceCloseDataModal();
  try{
    const res=await gas('saveRecord','employees',data,APP.token,{timeout:60000});
    mergeDataResult(res);
    updateToast(t,'Đã lưu nhân sự','Hồ sơ nhân sự đã được cập nhật.','success',3500);
    renderCurrentPage();
  }catch(err){updateToast(t,'Không thể lưu nhân sự',err.message,'error',5500);}
}

/* ========================= PROJECT MODAL ========================= */
function openProjectModal(id=''){
  const r=id?(APP.data.projects||[]).find(x=>x['Mã dự án']===id):{};const memberRows=id?(APP.data.projectMembers||[]).filter(m=>m['Mã dự án']===id):[];APP.state.pendingFiles=[];APP.state.projectMembers=memberRows.map(m=>m['Mã nhân sự']);
  const body=`<div class="form-section"><div class="form-section-title"><span class="material-symbols-rounded">folder_open</span>Thông tin dự án</div><div class="form-grid cols-3">
    ${id?formField('projects','Mã dự án',textInput('Mã dự án',r['Mã dự án'],'Tự sinh','text','readonly'),'Mã do hệ thống tự sinh.'):''}
    ${formField('projects','Tên dự án',textInput('Tên dự án',r['Tên dự án'],'Nhập tên dự án nội bộ'),'Tên dự án cần ngắn gọn, dễ nhận biết.',false,true)}
    ${formField('projects','Loại dự án',comboHtml('Loại dự án',r['Loại dự án'],categoryOptions('Loại dự án'),'Tìm loại dự án...'),'Dữ liệu lấy từ Danh mục.',false,true)}
    ${formField('projects','Mã người phụ trách',comboHtml('Mã người phụ trách',r['Mã người phụ trách'],personOptions(),'Tìm mã hoặc tên nhân sự...'),'Một người chịu trách nhiệm chính.',false,true)}
    ${formField('projects','Ngày bắt đầu',textInput('Ngày bắt đầu',toDateInput(r['Ngày bắt đầu']),'','date'),'Ngày bắt đầu kế hoạch.',false,true)}
    ${formField('projects','Ngày dự kiến kết thúc',textInput('Ngày dự kiến kết thúc',toDateInput(r['Ngày dự kiến kết thúc']),'','date'),'Phải từ ngày bắt đầu trở đi.',false,true)}
    ${formField('projects','Trạng thái',comboHtml('Trạng thái',r['Trạng thái']||'Chưa bắt đầu',fixedOptions('projectStatus'),'Chọn trạng thái'),'Trạng thái cố định phục vụ báo cáo.',false,true)}
    ${formField('projects','Mức độ ưu tiên',comboHtml('Mức độ ưu tiên',r['Mức độ ưu tiên']||'Bình thường',fixedOptions('priority'),'Chọn mức độ'),'Dùng để sắp xếp và cảnh báo.',false,true)}
    ${formField('projects','Tiến độ (%)',textInput('Tiến độ (%)',r['Tiến độ (%)']??0,'Tự tính','number','readonly'),'Hệ thống tự tính từ tiến độ công việc.')}
    ${formField('projects','Mô tả',textArea('Mô tả',r['Mô tả'],'Mô tả mục tiêu, phạm vi, kết quả mong đợi...'),'Mô tả nghiệp vụ của dự án.',true)}
    ${formField('projects','Ghi chú',textArea('Ghi chú',r['Ghi chú'],'Thông tin bổ sung...'),'Thông tin bổ sung.',true)}
  </div></div>
  <div class="form-section"><div class="form-section-title"><span class="material-symbols-rounded">group_add</span>Thành viên tham gia</div>${multiPersonPicker('project-members',APP.state.projectMembers,'Chọn nhiều nhân sự tham gia dự án. Người phụ trách chính không cần chọn lại ở đây.')}</div>
  <div class="form-section"><div class="form-section-title"><span class="material-symbols-rounded">attach_file</span>Tài liệu đính kèm</div>${uploadZoneHtml('Tài liệu dự án sẽ chỉ upload sau khi bấm Lưu dự án.')}</div>`;
  openModal(modalShell(id?'Cập nhật dự án':'Thêm dự án','Dự án có một người phụ trách chính và có thể có nhiều thành viên tham gia.',body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-project"><span class="material-symbols-rounded">save</span>Lưu dự án</button>`,'xwide'));
}
async function saveProjectModal(){
  const data=collectForm();const memberIds=getCheckedPeople('project-members');
  const toast=showToast('Đang lưu dự án','Dữ liệu dự án đang được kiểm tra và đồng bộ.','processing',0);
  try{
    const res=await gas('saveRecord','projects',data,APP.token,{timeout:60000});mergeDataResult(res);const id=res.id||data['Mã dự án'];
    if(id){const members=memberIds.filter(x=>x!==data['Mã người phụ trách']).map(employeeId=>({employeeId,role:'Thành viên',joinDate:data['Ngày bắt đầu'],status:data['Trạng thái']==='Hoàn thành'?'Đã kết thúc':'Đang tham gia'}));const r2=await gas('saveProjectMembers',id,members,APP.token,{timeout:60000});mergeDataResult(r2);}
    if(id && APP.state.pendingFiles.length) await uploadPendingFiles('Dự án',id);
    closeModal();updateToast(toast,'Đã lưu dự án','Dữ liệu và thành viên dự án đã được cập nhật.','success',3500);renderCurrentPage();
  }catch(err){updateToast(toast,'Không thể lưu dự án',err.message,'error',5500);}
}

/* ========================= USER MODAL ========================= */
function openUserModal(id=''){
  const r=id?(APP.data.users||[]).find(x=>x['Mã người dùng']===id):{};const role=r['Vai trò']||'Nhóm';
  const body=`<div class="form-grid">${id?formField('users','Mã người dùng',textInput('Mã người dùng',r['Mã người dùng'],'Tự sinh','text','readonly'),'Mã hệ thống.'):''}${formField('users','Tên đăng nhập',textInput('Tên đăng nhập',r['Tên đăng nhập'],'Ví dụ: nguyenvana'),'Không dùng khoảng trắng và không trùng tài khoản khác.',false,true)}${formField('users','Mật khẩu',textInput('Mật khẩu','',id?'Để trống để giữ mật khẩu hiện tại':'Nhập mật khẩu','password'),id?'Chỉ nhập khi cần đổi mật khẩu.':'Tài khoản mới bắt buộc có mật khẩu.',false,!id)}${formField('users','Vai trò',comboHtml('Vai trò',role,fixedOptions('userRole'),'Chọn vai trò'),'Vai trò quyết định chức năng được phép dùng.',false,true)}${formField('users','Mã nhân sự',comboHtml('Mã nhân sự',r['Mã nhân sự'],personOptions(),'Tìm mã hoặc tên nhân sự...'),'Liên kết tài khoản với hồ sơ nhân sự.',false,true)}${formField('users','Phạm vi dữ liệu',textInput('Phạm vi dữ liệu',r['Phạm vi dữ liệu']||roleScope(role),'Tự động theo vai trò','text','readonly'),'Nên dùng Toàn công ty cho Quản trị, Đội nhóm cho Quản lý, Cá nhân cho Nhóm.',false,true)}${formField('users','Trạng thái',comboHtml('Trạng thái',r['Trạng thái']||'Hoạt động',fixedOptions('userStatus'),'Chọn trạng thái'),'Tạm khóa sẽ ngăn đăng nhập.',false,true)}${formField('users','Ghi chú',textArea('Ghi chú',r['Ghi chú'],'Ghi chú tài khoản...'),'Thông tin nội bộ.',true)}</div>`;
  openModal(modalShell(id?'Cập nhật người dùng':'Thêm người dùng','Quyền được kiểm tra lại ở phía hệ thống khi thực hiện thao tác quan trọng.',body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-user">Lưu tài khoản</button>`,'wide'));
}
async function saveUserModal(){await saveSimpleRecord('users',collectForm(),'Đang lưu tài khoản...','Đã lưu tài khoản.');}
function roleScope(role){return role==='Quản trị'?'Toàn công ty':role==='Quản lý'?'Đội nhóm':'Cá nhân';}

/* ========================= CATEGORY MODAL ========================= */
function openCategoryModal(group,value=''){openModal(modalShell(value?'Sửa giá trị danh mục':'Thêm giá trị danh mục',group,`<div class="form-grid"><div class="form-field full"><label>Nhóm danh mục</label><input value="${escapeAttr(group)}" readonly><div class="field-help">Nhóm đang chọn trong module Danh mục.</div></div><div class="form-field full"><label>Giá trị <span class="required">*</span></label><input id="category-value" value="${escapeAttr(value)}" placeholder="Nhập giá trị danh mục"><div class="field-help">Giá trị chỉ dùng để phân loại linh hoạt, không thay thế trạng thái cố định của hệ thống.</div></div><input type="hidden" id="category-old" value="${escapeAttr(value)}"><input type="hidden" id="category-group" value="${escapeAttr(group)}"></div>`,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-category">Lưu giá trị</button>`,'small'));}
async function saveCategoryModal(){const group=document.getElementById('category-group').value,oldV=document.getElementById('category-old').value,newV=document.getElementById('category-value').value.trim();const t=showToast('Đang lưu danh mục','Đang cập nhật dữ liệu lựa chọn.','processing',0);try{const res=await gas('saveCategoryItem',group,oldV,newV,APP.token,{timeout:45000});mergeDataResult(res);closeModal();updateToast(t,'Đã lưu danh mục','Giá trị đã được cập nhật.','success',3000);renderCurrentPage();}catch(err){updateToast(t,'Không thể lưu',err.message,'error',5000);}}

/* ========================= KPI TEMPLATE MODAL ========================= */
function openKpiTemplateModal(id=''){
  const r=id?(APP.data.kpiTemplates||[]).find(x=>x['Mã mẫu KPI']===id):{};const details=id?(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===id).map(d=>({...d})):[];APP.state.templateDraftDetails=details.length?details:[newTemplateDetail()];
  renderKpiTemplateModal(id,r);
}
function newTemplateDetail(){return {'Mã chỉ tiêu mẫu':'','Tên chỉ tiêu':'','Nhóm KPI':'','Đơn vị tính':'%','Mục tiêu mặc định':100,'Trọng số (%)':20,'Cách ghi nhận':'Nhóm tự nhập','Chiều đánh giá':'Càng cao càng tốt','Điểm tối đa':120,'Trạng thái':'Đang áp dụng','Ghi chú':''};}
function renderKpiTemplateModal(id,r){
  const basic=`<div class="form-section"><div class="form-section-title"><span class="material-symbols-rounded">description</span>Thông tin mẫu</div><div class="form-grid cols-3">${id?formField('kpiTemplates','Mã mẫu KPI',textInput('Mã mẫu KPI',r['Mã mẫu KPI'],'Tự sinh','text','readonly'),'Mã hệ thống.'):''}${formField('kpiTemplates','Tên mẫu KPI',textInput('Tên mẫu KPI',r['Tên mẫu KPI'],'Ví dụ: KPI Marketing'),'Tên bộ KPI.',false,true)}${formField('kpiTemplates','Phạm vi áp dụng',comboHtml('Phạm vi áp dụng',r['Phạm vi áp dụng']||'Nhóm',['Nhóm','Chức vụ','Nhân sự'],'Chọn phạm vi'),'Chọn đối tượng áp dụng.',false,true)}${formField('kpiTemplates','Giá trị áp dụng',textInput('Giá trị áp dụng',r['Giá trị áp dụng'],'Ví dụ: Marketing'),'Nhập đúng tên Nhóm/chức vụ hoặc mã nhân sự.',false,true)}${formField('kpiTemplates','Trạng thái',comboHtml('Trạng thái',r['Trạng thái']||'Đang áp dụng',fixedOptions('templateStatus'),'Chọn trạng thái'),'Mẫu đang áp dụng mới dùng cho kỳ mới.',false,true)}${formField('kpiTemplates','Ngày hiệu lực',textInput('Ngày hiệu lực',toDateInput(r['Ngày hiệu lực']||new Date()),'','date'),'Ngày bắt đầu áp dụng.')}${formField('kpiTemplates','Mô tả',textArea('Mô tả',r['Mô tả'],'Mô tả mục tiêu bộ KPI...'),'Mô tả ngắn.',true)}</div></div>`;
  const detailRows=APP.state.templateDraftDetails.map((d,i)=>`<tr><td><input data-template-index="${i}" data-template-field="Tên chỉ tiêu" value="${escapeAttr(d['Tên chỉ tiêu'])}" placeholder="Tên chỉ tiêu"></td><td>${simpleSelectHtml(i,'Nhóm KPI',d['Nhóm KPI'],APP.data.categories?.['Nhóm KPI']||[])}</td><td><input data-template-index="${i}" data-template-field="Đơn vị tính" value="${escapeAttr(d['Đơn vị tính'])}" placeholder="% / Điểm"></td><td><input type="number" data-template-index="${i}" data-template-field="Mục tiêu mặc định" value="${escapeAttr(d['Mục tiêu mặc định'])}"></td><td><input type="number" data-template-index="${i}" data-template-field="Trọng số (%)" value="${escapeAttr(d['Trọng số (%)'])}"></td><td>${simpleSelectHtml(i,'Cách ghi nhận',d['Cách ghi nhận'],APP.data.fixedOptions?.dataCapture||[])}</td><td><button class="row-action danger" type="button" onclick="removeTemplateDetail(${i})"><span class="material-symbols-rounded">delete</span></button></td></tr>`).join('');
  const weight=APP.state.templateDraftDetails.reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0);
  const body=`${basic}<div class="form-section"><div class="section-title-row"><div class="form-section-title" style="margin:0"><span class="material-symbols-rounded">format_list_bulleted</span>Chỉ tiêu KPI</div><div><span class="badge ${Math.round(weight)===100?'badge-green':'badge-red'}">Tổng trọng số: ${round1(weight)}%</span> <button class="btn btn-sm" type="button" onclick="addTemplateDetail()"><span class="material-symbols-rounded">add</span>Thêm chỉ tiêu</button></div></div><div class="wizard-grid-wrap"><table class="wizard-table" style="min-width:980px"><thead><tr><th>Tên chỉ tiêu</th><th>Nhóm KPI</th><th>Đơn vị</th><th>Mục tiêu</th><th>Trọng số (%)</th><th>Cách ghi nhận</th><th></th></tr></thead><tbody>${detailRows}</tbody></table></div><div class="field-help">Tổng trọng số của các chỉ tiêu đang áp dụng phải bằng 100%. Điểm mỗi chỉ tiêu tối đa 120.</div></div>`;
  openModal(modalShell(id?'Cập nhật mẫu KPI':'Thêm mẫu KPI','Thiết lập bộ chỉ tiêu gọn, rõ và đủ trọng số trước khi tạo KPI tháng.',body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-template">Lưu mẫu KPI</button>`,'xwide'));
}
window.addTemplateDetail=function(){syncTemplateDraftFromDom();APP.state.templateDraftDetails.push(newTemplateDetail());const id=document.querySelector('[data-field="Mã mẫu KPI"]')?.value||'';const r=id?(APP.data.kpiTemplates||[]).find(x=>x['Mã mẫu KPI']===id):collectForm();renderKpiTemplateModal(id,r||{});};
window.removeTemplateDetail=function(i){syncTemplateDraftFromDom();APP.state.templateDraftDetails.splice(i,1);if(!APP.state.templateDraftDetails.length)APP.state.templateDraftDetails.push(newTemplateDetail());const id=document.querySelector('[data-field="Mã mẫu KPI"]')?.value||'';const r=id?(APP.data.kpiTemplates||[]).find(x=>x['Mã mẫu KPI']===id):collectForm();renderKpiTemplateModal(id,r||{});};
function simpleSelectHtml(i,field,value,options){return `<select data-template-index="${i}" data-template-field="${escapeAttr(field)}" style="height:34px;border:1px solid var(--line);border-radius:7px;background:var(--surface);color:var(--text);width:100%">${options.map(o=>`<option value="${escapeAttr(o)}" ${o===value?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select>`;}
function syncTemplateDraftFromDom(){document.querySelectorAll('[data-template-index]').forEach(el=>{const i=Number(el.dataset.templateIndex),f=el.dataset.templateField;if(APP.state.templateDraftDetails[i])APP.state.templateDraftDetails[i][f]=el.type==='number'?Number(el.value):el.value;});}
async function saveKpiTemplateModal(){
  syncTemplateDraftFromDom();const basic=collectForm();const weight=APP.state.templateDraftDetails.reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0);if(Math.abs(weight-100)>.01){showToast('Chưa thể lưu','Tổng trọng số chỉ tiêu phải bằng 100%.','error');return;}const t=showToast('Đang lưu mẫu KPI','Đang cập nhật mẫu và các chỉ tiêu.','processing',0);
  try{const res=await gas('saveRecord','kpiTemplates',basic,APP.token,{timeout:60000});mergeDataResult(res);const templateId=res.id||basic['Mã mẫu KPI'];const old=(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===templateId);const kept=new Set(APP.state.templateDraftDetails.map(d=>d['Mã chỉ tiêu mẫu']).filter(Boolean));for(const o of old){if(!kept.has(o['Mã chỉ tiêu mẫu'])){const rr=await gas('deleteRecord','kpiTemplateDetails',o['Mã chỉ tiêu mẫu'],APP.token,{timeout:45000});mergeDataResult(rr);}}
    for(const d of APP.state.templateDraftDetails){d['Mã mẫu KPI']=templateId;d['Điểm tối đa']=120;d['Chiều đánh giá']=d['Chiều đánh giá']||'Càng cao càng tốt';d['Trạng thái']=d['Trạng thái']||'Đang áp dụng';const rr=await gas('saveRecord','kpiTemplateDetails',d,APP.token,{timeout:45000});mergeDataResult(rr);}closeModal();updateToast(t,'Đã lưu mẫu KPI','Bộ chỉ tiêu và trọng số đã được cập nhật.','success',3500);renderCurrentPage();
  }catch(err){updateToast(t,'Không thể lưu mẫu KPI',err.message,'error',5500);}
}

/* ========================= TASK WIZARD ========================= */
function openTaskWizard(editId=''){
  const source=editId?(APP.data.tasks||[]).find(t=>t['Mã công việc']===editId):null;
  const row=source?taskToWizardRow(source):blankTaskWizardRow();
  APP.state.wizard={mode:editId?'edit':'create',step:1,rows:[row],editId,startedAt:Date.now()};
  renderTaskWizard();
}
function blankTaskWizardRow(){return {__tempId:'tmp_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),__expanded:true,__files:[],__participants:[],__errors:[],
  'Mã công việc':'','Tên công việc':'','Mã dự án':'','Nhóm công việc':'','Mã người phụ trách':'','Mã người giao việc':APP.session.employeeId,
  'Ngày bắt đầu':toDateInput(new Date()),'Hạn hoàn thành':toDateInput(new Date(Date.now()+7*86400000)),'Mức độ ưu tiên':'Bình thường','Trạng thái':'Chưa bắt đầu','Tiến độ (%)':0,'Trọng số công việc':1,'Kết quả':'','Mô tả':'','Ghi chú':''};}
function taskToWizardRow(t){const parts=(APP.data.taskParticipants||[]).filter(p=>p['Mã công việc']===t['Mã công việc']).map(p=>p['Mã nhân sự']);return {...t,__tempId:'tmp_'+t['Mã công việc'],__expanded:true,__files:[],__participants:parts,__errors:[],'Ngày bắt đầu':toDateInput(t['Ngày bắt đầu']),'Hạn hoàn thành':toDateInput(t['Hạn hoàn thành'])};}
function renderTaskWizard(){
  const w=APP.state.wizard;if(!w)return;const title=w.mode==='edit'?'Cập nhật công việc':'Giao công việc';
  const steps=`<div class="wizard-steps"><div class="wizard-step ${w.step===1?'active':w.step>1?'done':''}"><span class="wizard-step-number">1</span><span>Nhập thông tin</span></div><div class="wizard-step ${w.step===2?'active':''}"><span class="wizard-step-number">2</span><span>Kiểm tra thông tin</span></div></div>`;
  const body=w.step===1?renderTaskWizardEntry():renderTaskWizardReview();
  const footer=w.step===1?`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="wizard-next">Tiếp tục <span class="material-symbols-rounded">arrow_forward</span></button>`:`<button class="btn" data-action="wizard-back"><span class="material-symbols-rounded">arrow_back</span>Quay lại</button><button class="btn btn-primary" data-action="wizard-save"><span class="material-symbols-rounded">save</span>${w.mode==='edit'?'Lưu thay đổi':'Lưu công việc'}</button>`;
  openModal(`<div class="modal xwide"><div class="modal-head"><div><h2>${title}</h2><p>${w.mode==='edit'?'Cập nhật một công việc và kiểm tra trước khi lưu.':'Nhập một hoặc nhiều công việc. File được giữ riêng theo từng dòng và chỉ upload khi lưu.'}</p></div><button class="modal-close" data-action="close-modal"><span class="material-symbols-rounded">close</span></button></div>${steps}<div class="modal-body">${body}</div><div class="modal-footer"><div id="wizard-progress-text" style="margin-right:auto;color:var(--muted);font-size:11px"></div>${footer}</div></div>`);
}
function renderTaskWizardEntry(){const w=APP.state.wizard;const toolbar=w.mode==='create'?`<div class="wizard-toolbar"><button class="btn btn-sm" data-action="wizard-add-one"><span class="material-symbols-rounded">add</span>Thêm 1 bản ghi</button><button class="btn btn-sm" data-action="wizard-add-five"><span class="material-symbols-rounded">playlist_add</span>Thêm 5 bản ghi</button><button class="btn btn-sm" data-action="wizard-remove-empty"><span class="material-symbols-rounded">delete_sweep</span>Xóa bản ghi trống</button><button class="btn btn-sm" data-action="wizard-collapse"><span class="material-symbols-rounded">unfold_less</span>Thu gọn tất cả</button><button class="btn btn-sm" data-action="wizard-expand"><span class="material-symbols-rounded">unfold_more</span>Mở rộng tất cả</button></div>`:'';
  return `${toolbar}<div class="wizard-grid-wrap"><table class="wizard-table"><thead><tr><th style="width:44px">TT</th><th style="min-width:240px">${wizardHeader('tasks','Tên công việc')}</th><th style="min-width:220px">${wizardHeader('tasks','Mã dự án')}</th><th style="min-width:160px">${wizardHeader('tasks','Nhóm công việc')}</th><th style="min-width:220px">${wizardHeader('tasks','Mã người phụ trách')}</th><th style="min-width:145px">${wizardHeader('tasks','Hạn hoàn thành')}</th><th style="min-width:135px">${wizardHeader('tasks','Mức độ ưu tiên')}</th><th style="min-width:120px">Tiến độ</th><th style="width:115px">Tài liệu</th><th style="width:100px">Thao tác</th></tr></thead><tbody>${w.rows.map((r,i)=>renderTaskWizardRow(r,i)).join('')}</tbody></table></div><div class="field-help">Các ô chọn hỗ trợ tìm theo mã hoặc tên. Bấm mũi tên mở rộng từng dòng để nhập mô tả, kết quả, người tham gia và file đính kèm.</div>`;}
function renderTaskWizardRow(r,i){const invalid=r.__errors?.length;return `<tr><td><div style="display:flex;align-items:center;gap:6px"><span class="row-status ${invalid?'invalid':''}"></span><strong>${i+1}</strong></div></td><td><input class="${fieldHasError(r,'Tên công việc')?'invalid':''}" data-wizard-field="Tên công việc" data-tempid="${r.__tempId}" value="${escapeAttr(r['Tên công việc'])}" placeholder="Nhập tên công việc"></td><td>${wizardCombo(r,'Mã dự án',projectOptions(),'Tìm dự án...')}</td><td>${wizardCombo(r,'Nhóm công việc',categoryOptions('Nhóm công việc'),'Tìm nhóm...')}</td><td>${wizardCombo(r,'Mã người phụ trách',personOptions(),'Tìm nhân sự...')}</td><td><input type="date" data-wizard-field="Hạn hoàn thành" data-tempid="${r.__tempId}" value="${escapeAttr(r['Hạn hoàn thành'])}"></td><td>${wizardCombo(r,'Mức độ ưu tiên',fixedOptions('priority'),'Chọn ưu tiên')}</td><td><input type="number" min="0" max="100" data-wizard-field="Tiến độ (%)" data-tempid="${r.__tempId}" value="${escapeAttr(r['Tiến độ (%)']??0)}"></td><td><button class="btn btn-sm file-input-inline" data-action="wizard-file-trigger" data-tempid="${r.__tempId}"><span class="material-symbols-rounded">attach_file</span>${r.__files.length?r.__files.length+' file':'Chọn file'}</button><input class="hidden" type="file" multiple data-wizard-file="${r.__tempId}"></td><td><div class="row-actions"><button class="row-action" data-action="wizard-toggle-row" data-tempid="${r.__tempId}" title="Mở rộng"><span class="material-symbols-rounded">${r.__expanded?'expand_less':'expand_more'}</span></button>${APP.state.wizard.mode==='create'?`<button class="row-action" data-action="wizard-duplicate-row" data-tempid="${r.__tempId}" title="Nhân bản"><span class="material-symbols-rounded">content_copy</span></button><button class="row-action danger" data-action="wizard-remove-row" data-tempid="${r.__tempId}" title="Xóa dòng"><span class="material-symbols-rounded">delete</span></button>`:''}</div></td></tr>${r.__expanded?`<tr><td colspan="10" style="background:var(--surface-2);padding:10px"><div class="form-grid cols-3"><div class="form-field"><label>Ngày bắt đầu ${tooltipIcon(getFieldTooltip('tasks','Ngày bắt đầu'))}</label><input type="date" data-wizard-field="Ngày bắt đầu" data-tempid="${r.__tempId}" value="${escapeAttr(r['Ngày bắt đầu'])}"><div class="field-help">Ngày bắt đầu thực hiện.</div></div><div class="form-field"><label>Trạng thái ${tooltipIcon(getFieldTooltip('tasks','Trạng thái'))}</label>${wizardCombo(r,'Trạng thái',fixedOptions('taskStatus'),'Chọn trạng thái')}</div><div class="form-field"><label>Trọng số công việc ${tooltipIcon(getFieldTooltip('tasks','Trọng số công việc'))}</label><input type="number" min="0.1" max="10" step="0.1" data-wizard-field="Trọng số công việc" data-tempid="${r.__tempId}" value="${escapeAttr(r['Trọng số công việc']??1)}"><div class="field-help">Mặc định 1; việc nặng hơn có thể tăng hệ số.</div></div><div class="form-field"><label>Người tham gia</label>${multiPersonPicker('wizard-part-'+r.__tempId,r.__participants,'Chọn người phối hợp. KPI chính không tính toàn bộ cho người tham gia.')}</div><div class="form-field full"><label>Mô tả ${tooltipIcon(getFieldTooltip('tasks','Mô tả'))}</label><textarea data-wizard-field="Mô tả" data-tempid="${r.__tempId}" placeholder="Mô tả yêu cầu công việc...">${escapeHtml(r['Mô tả']||'')}</textarea></div><div class="form-field full"><label>Kết quả ${tooltipIcon(getFieldTooltip('tasks','Kết quả'))}</label><textarea data-wizard-field="Kết quả" data-tempid="${r.__tempId}" placeholder="Nhập kết quả hoặc để trống khi chưa hoàn thành...">${escapeHtml(r['Kết quả']||'')}</textarea></div><div class="form-field full"><label>File đã chọn</label><div class="pending-files">${r.__files.length?r.__files.map((f,fi)=>`<div class="file-chip"><div class="file-chip-icon"><span class="material-symbols-rounded">${fileIcon(f.type)}</span></div><div><strong>${escapeHtml(f.name)}</strong><small>${formatFileSize(f.size)}</small></div><div class="file-chip-actions"><button class="row-action danger" data-action="wizard-remove-file" data-tempid="${r.__tempId}" data-fileindex="${fi}"><span class="material-symbols-rounded">close</span></button></div></div>`).join(''):'<span class="muted">Chưa chọn file.</span>'}</div></div></div>${r.__errors?.length?`<div class="wizard-error-summary" style="margin-top:8px">${r.__errors.map(x=>escapeHtml(x)).join('<br>')}</div>`:''}</td></tr>`:''}`;}
function wizardCombo(row,field,options,placeholder){const selected=(options||[]).find(o=>String(o.value)===String(row[field]));return `<div class="combo" data-wizard-combo="true" data-tempid="${row.__tempId}" data-wizard-name="${escapeAttr(field)}"><div class="combo-control"><input class="combo-display" value="${escapeAttr(selected?.label||row[field]||'')}" placeholder="${escapeAttr(placeholder)}" autocomplete="off"><button class="combo-arrow" type="button"><span class="material-symbols-rounded">expand_more</span></button></div><input type="hidden" data-wizard-field="${escapeAttr(field)}" data-tempid="${row.__tempId}" value="${escapeAttr(row[field]||'')}"><div class="combo-source hidden">${(options||[]).map(o=>`<span data-value="${escapeAttr(o.value)}" data-label="${escapeAttr(o.label)}"></span>`).join('')}</div></div>`;}
function wizardHeader(module,field){const tip=getFieldTooltip(module,field);return `${escapeHtml(field)}${tip?tooltipIcon(tip):''}`;}
function fieldHasError(r,field){return (r.__fieldErrors||{})[field];}
function updateWizardInput(el){const w=APP.state.wizard;if(!w)return;const r=w.rows.find(x=>x.__tempId===el.dataset.tempid);if(!r)return;let v=el.value;if(el.type==='number')v=Number(v||0);r[el.dataset.wizardField]=v;if(el.dataset.wizardField==='Mã người phụ trách'&&r.__participants.includes(v))r.__participants=r.__participants.filter(x=>x!==v);}
function wizardAddRows(n){if(!APP.state.wizard||APP.state.wizard.mode!=='create')return;for(let i=0;i<n;i++)APP.state.wizard.rows.push(blankTaskWizardRow());renderTaskWizard();}
function wizardRemoveRow(id){const w=APP.state.wizard;if(!w)return;w.rows=w.rows.filter(r=>r.__tempId!==id);if(!w.rows.length)w.rows=[blankTaskWizardRow()];renderTaskWizard();}
function wizardDuplicateRow(id){const w=APP.state.wizard,r=w?.rows.find(x=>x.__tempId===id);if(!r)return;const copy={...r,__tempId:'tmp_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),__files:[...(r.__files||[])],__participants:[...(r.__participants||[])],__errors:[],__fieldErrors:{}};copy['Mã công việc']='';w.rows.push(copy);renderTaskWizard();}
function wizardRemoveEmpty(){const w=APP.state.wizard;if(!w)return;w.rows=w.rows.filter(r=>String(r['Tên công việc']||'').trim()||String(r['Mã dự án']||'').trim()||r.__files.length);if(!w.rows.length)w.rows=[blankTaskWizardRow()];renderTaskWizard();}
function wizardSetExpanded(flag){const w=APP.state.wizard;if(!w)return;w.rows.forEach(r=>r.__expanded=flag);renderTaskWizard();}
function wizardToggleRow(id){const r=APP.state.wizard?.rows.find(x=>x.__tempId===id);if(r){r.__expanded=!r.__expanded;renderTaskWizard();}}
function wizardSetFiles(tempId,files){
  const r=APP.state.wizard?.rows.find(x=>x.__tempId===tempId);if(!r)return;
  r.__files=mergeFileLists(r.__files||[],files||[],20*1024*1024);
  renderTaskWizard();
}
function wizardRemoveFile(tempId,index){const r=APP.state.wizard?.rows.find(x=>x.__tempId===tempId);if(r){r.__files.splice(index,1);renderTaskWizard();}}
function wizardStep(delta){const w=APP.state.wizard;if(!w)return;if(delta>0){syncWizardParticipants();const errors=validateWizardRows();if(errors){renderTaskWizard();showToast('Cần bổ sung thông tin','Một số dòng chưa hợp lệ. Kiểm tra các cảnh báo trước khi tiếp tục.','warning');return;}w.step=2;}else w.step=1;renderTaskWizard();}
function syncWizardParticipants(){const w=APP.state.wizard;if(!w)return;w.rows.forEach(r=>{r.__participants=getCheckedPeople('wizard-part-'+r.__tempId).filter(x=>x!==r['Mã người phụ trách']);});}
function validateWizardRows(){const w=APP.state.wizard;let total=0;const seen=new Set();w.rows.forEach((r,i)=>{r.__errors=[];r.__fieldErrors={};const req=['Tên công việc','Mã dự án','Nhóm công việc','Mã người phụ trách','Ngày bắt đầu','Hạn hoàn thành','Mức độ ưu tiên','Trạng thái'];req.forEach(f=>{if(r[f]===''||r[f]===null||r[f]===undefined){r.__errors.push(`Thiếu ${f}`);r.__fieldErrors[f]=true;}});const start=parseDate(r['Ngày bắt đầu']),due=parseDate(r['Hạn hoàn thành']);if(start&&due&&due<start){r.__errors.push('Hạn hoàn thành phải từ ngày bắt đầu trở đi.');r.__fieldErrors['Hạn hoàn thành']=true;}const key=normalizeText(r['Tên công việc'])+'|'+r['Mã dự án']+'|'+r['Mã người phụ trách']+'|'+r['Hạn hoàn thành'];if(seen.has(key)){r.__errors.push('Dòng có khả năng bị trùng với một dòng khác trong biểu mẫu.');}seen.add(key);const taskWeight=Number(r['Trọng số công việc']??1);if(!Number.isFinite(taskWeight)||taskWeight<=0||taskWeight>10){r.__errors.push('Trọng số công việc phải lớn hơn 0 và không vượt quá 10.');r.__fieldErrors['Trọng số công việc']=true;}if(APP.session.role==='Nhóm'&&r['Trạng thái']==='Hoàn thành')r.__errors.push('Nhóm không thể tự đặt trạng thái Hoàn thành.');total+=r.__errors.length;});return total;}
function renderTaskWizardReview(){const w=APP.state.wizard;validateWizardRows();return `<div class="section-title-row"><div><h2>Kiểm tra thông tin trước khi lưu</h2><small>${w.rows.length} bản ghi · ${w.rows.reduce((s,r)=>s+r.__files.length,0)} file đính kèm</small></div><span class="badge ${w.rows.some(r=>r.__errors.length)?'badge-red':'badge-green'}">${w.rows.some(r=>r.__errors.length)?'Cần sửa':'Dữ liệu hợp lệ'}</span></div><div class="wizard-review">${w.rows.map((r,i)=>`<div class="review-row"><div class="row-status ${r.__errors.length?'invalid':'valid'}"></div><div><strong>${i+1}. ${escapeHtml(r['Tên công việc']||'Chưa nhập tên')}</strong><p>${escapeHtml(projectName(r['Mã dự án']))} · ${escapeHtml(employeeName(r['Mã người phụ trách']))} · Hạn ${formatDate(r['Hạn hoàn thành'])} · ${r.__participants.length} người tham gia · ${r.__files.length} file</p>${r.__errors.length?`<div class="wizard-error-summary" style="margin-top:7px">${r.__errors.map(e=>escapeHtml(e)).join('<br>')}</div>`:''}</div><div>${r.__errors.length?statusBadge('Cần bổ sung'):statusBadge('Hợp lệ')}</div></div>`).join('')}</div>`;}
async function saveTaskWizard(){const w=APP.state.wizard;if(!w)return;syncWizardParticipants();if(validateWizardRows()){w.step=1;renderTaskWizard();showToast('Chưa thể lưu','Vui lòng sửa các dòng lỗi trước khi lưu.','error');return;}const toast=showToast('Đang lưu công việc','Hệ thống đang xử lý dữ liệu. File có thể cần thêm thời gian upload.','processing',0);const setProgress=(msg)=>{const el=document.getElementById('wizard-progress-text');if(el)el.textContent=msg;};
  try{
    if(w.mode==='edit'){
      const r=w.rows[0];setProgress('Đang lưu công việc...');const clean=stripWizardRow(r);const res=await gas('saveRecord','tasks',clean,APP.token,{timeout:60000});mergeDataResult(res);const id=res.id||clean['Mã công việc'];if(APP.permissions.canManageTasks){const pr=await gas('saveTaskParticipants',id,r.__participants.map(employeeId=>({employeeId,role:'Phối hợp',joinDate:r['Ngày bắt đầu'],status:r['Trạng thái']==='Hoàn thành'?'Đã kết thúc':'Đang tham gia'})),APP.token,{timeout:60000});mergeDataResult(pr);}if(r.__files.length){for(let fi=0;fi<r.__files.length;fi++){setProgress(`Đang upload file ${fi+1}/${r.__files.length}...`);await uploadOneFile(r.__files[fi],'Công việc',id);}}
    }else{
      const hasFiles=w.rows.some(r=>r.__files.length);
      if(!hasFiles){setProgress(`Đang lưu ${w.rows.length} công việc...`);const res=await gas('bulkAddRecords','tasks',w.rows.map(stripWizardRow),APP.token,{timeout:90000});if(res.success===false)throw new Error(res.errors?.map(x=>`Dòng ${x.row}: ${x.errors.join(', ')}`).join('; ')||'Có dòng dữ liệu không hợp lệ.');mergeDataResult(res);const ids=res.ids||[];for(let i=0;i<ids.length;i++){if(w.rows[i].__participants.length){setProgress(`Đang cập nhật người tham gia ${i+1}/${ids.length}...`);const pr=await gas('saveTaskParticipants',ids[i],w.rows[i].__participants.map(employeeId=>({employeeId,role:'Phối hợp',joinDate:w.rows[i]['Ngày bắt đầu'],status:'Đang tham gia'})),APP.token,{timeout:60000});mergeDataResult(pr);}}}
      else{
        for(let i=0;i<w.rows.length;i++){const r=w.rows[i];setProgress(`Đang xử lý dòng ${i+1}/${w.rows.length}...`);const res=await gas('saveRecord','tasks',stripWizardRow(r),APP.token,{timeout:60000});mergeDataResult(res);const id=res.id;if(r.__participants.length){const pr=await gas('saveTaskParticipants',id,r.__participants.map(employeeId=>({employeeId,role:'Phối hợp',joinDate:r['Ngày bắt đầu'],status:'Đang tham gia'})),APP.token,{timeout:60000});mergeDataResult(pr);}for(let fi=0;fi<r.__files.length;fi++){setProgress(`Dòng ${i+1}/${w.rows.length}: upload file ${fi+1}/${r.__files.length}...`);await uploadOneFile(r.__files[fi],'Công việc',id);}}
      }
    }
    closeModal();updateToast(toast,'Đã lưu công việc','Dữ liệu công việc, người tham gia và file đính kèm đã được cập nhật.','success',4000);renderCurrentPage();
  }catch(err){updateToast(toast,'Không thể lưu công việc',err.message,'error',6500);setProgress('Có lỗi khi lưu. Dữ liệu đã lưu thành công trước thời điểm lỗi vẫn được giữ lại.');}
}
function stripWizardRow(r){const out={};Object.keys(r).forEach(k=>{if(!k.startsWith('__'))out[k]=r[k];});return out;}

/* ========================= TASK STATUS / CONFIRM ========================= */
function openTaskStatusModal(id){const t=(APP.data.tasks||[]).find(x=>x['Mã công việc']===id);if(!t)return;const allowed=APP.session.role==='Nhóm'?['Chưa bắt đầu','Đang thực hiện','Chờ xác nhận']:APP.data.fixedOptions?.taskStatus||[];const body=`<div class="form-grid">${formField('tasks','Trạng thái',comboHtml('Trạng thái',t['Trạng thái'],allowed,'Chọn trạng thái'),'Nhóm làm xong cần chuyển Chờ xác nhận.',false,true)}${formField('tasks','Tiến độ (%)',textInput('Tiến độ (%)',t['Tiến độ (%)']||0,'0 - 100','number','min="0" max="100"'),'Nhập tiến độ từ 0 đến 100%.')}${formField('tasks','Kết quả',textArea('Kết quả',t['Kết quả'],'Mô tả kết quả đã thực hiện...'),'Nên bổ sung kết quả trước khi chuyển Chờ xác nhận.',true)}<input type="hidden" data-field="Mã công việc" value="${escapeAttr(id)}"></div>`;openModal(modalShell('Cập nhật công việc',t['Tên công việc'],body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-task-status">Cập nhật</button>`,'small'));}
async function saveTaskStatusModal(){const f=collectForm();const toast=showToast('Đang cập nhật công việc','Không cần tải lại toàn bộ hệ thống.','processing',0);try{const res=await gas('changeTaskStatus',f['Mã công việc'],f['Trạng thái'],Number(f['Tiến độ (%)']),f['Kết quả'],APP.token,{timeout:60000});mergeDataResult(res);closeModal();updateToast(toast,'Đã cập nhật công việc','Trạng thái và tiến độ đã được đồng bộ.','success',3000);renderCurrentPage();}catch(err){updateToast(toast,'Không thể cập nhật',err.message,'error',5000);}}
function openConfirmTaskModal(id){
  const t=(APP.data.tasks||[]).find(x=>x['Mã công việc']===id);
  if(!t)return;
  openModal(modalShell(
    'Xác nhận công việc',
    t['Tên công việc'],
    `<div class="form-section">
      <div class="form-section-title"><span class="material-symbols-rounded">task_alt</span>Kết quả người thực hiện gửi</div>
      <div class="task-rich-content">${safeRichHtml(t['Kết quả']||'Chưa nhập kết quả.')}</div>
    </div>
    <div class="form-field">
      <label>Nhận xét của quản lý</label>
      <textarea id="confirm-task-note" placeholder="Nhập nhận xét. Nếu trả lại thì bắt buộc nêu rõ nội dung cần bổ sung..."></textarea>
      <div class="field-help">Nội dung này được lưu riêng với Kết quả công việc. Khi Trả lại, nhận xét là bắt buộc.</div>
    </div>
    <input type="hidden" id="confirm-task-id" value="${escapeAttr(id)}">`,
    `<button class="btn" data-action="save-task-confirm" data-approved="false"><span class="material-symbols-rounded">undo</span>Trả lại thực hiện</button>
     <button class="btn btn-success" data-action="save-task-confirm" data-approved="true"><span class="material-symbols-rounded">verified</span>Xác nhận hoàn thành</button>`,
    'small'
  ));
}
async function saveTaskConfirmModal(button){
  const id=document.getElementById('confirm-task-id')?.value;
  const note=(document.getElementById('confirm-task-note')?.value||'').trim();
  const approved=button?.dataset.approved==='true';
  if(!approved&&!note){
    showToast('Thiếu nhận xét','Vui lòng nhập lý do/nội dung cần bổ sung trước khi trả lại công việc.','warning',4200);
    document.getElementById('confirm-task-note')?.focus();
    return;
  }
  const toast=showToast(approved?'Đang xác nhận':'Đang trả lại công việc','Hệ thống đang cập nhật trạng thái, nhận xét quản lý và KPI liên quan.','processing',0);
  try{
    const res=await gas('confirmTask',id,approved,note,APP.token,{timeout:60000});
    mergeDataResult(res);closeModal();
    updateToast(toast,approved?'Đã xác nhận hoàn thành':'Đã trả lại thực hiện',approved?'Công việc được ghi nhận Hoàn thành.':'Công việc chuyển lại Đang thực hiện và giữ riêng nhận xét quản lý.','success',3500);
    renderCurrentPage();
  }catch(err){updateToast(toast,'Không thể xử lý',err.message,'error',5000);}
}

function openReopenTaskModal(id){
  const t=(APP.data.tasks||[]).find(x=>x['Mã công việc']===id);
  if(!t)return;
  openModal(modalShell(
    'Mở lại công việc',
    t['Tên công việc'],
    `<div class="form-section">
      <div class="form-section-title"><span class="material-symbols-rounded">history</span>Thông tin lần hoàn thành gần nhất</div>
      <div class="task-rich-content" style="margin-bottom:8px"><strong>Kết quả:</strong>${safeRichHtml(t['Kết quả']||'Chưa có kết quả.')}</div>
      <p style="margin:0;color:var(--muted);line-height:1.5;white-space:pre-wrap"><strong>Nhận xét quản lý:</strong> ${escapeHtml(t['Nhận xét quản lý']||'Chưa có nhận xét.')}</p>
    </div>
    <div class="form-field">
      <label>Lý do mở lại <span class="required">*</span></label>
      <textarea id="reopen-task-reason" placeholder="Nêu rõ nội dung chưa đạt hoặc phần cần tiếp tục thực hiện..."></textarea>
      <div class="field-help">Công việc sẽ chuyển về Đang thực hiện. Kết quả cũ vẫn được giữ để người thực hiện tiếp tục cập nhật.</div>
    </div>
    <input type="hidden" id="reopen-task-id" value="${escapeAttr(id)}">`,
    `<button class="btn" data-action="close-modal">Hủy</button>
     <button class="btn btn-primary" data-action="save-task-reopen"><span class="material-symbols-rounded">restart_alt</span>Mở lại công việc</button>`,
    'small'
  ));
}

async function saveTaskReopenModal(button){
  const id=document.getElementById('reopen-task-id')?.value;
  const reason=(document.getElementById('reopen-task-reason')?.value||'').trim();
  if(!reason){
    showToast('Thiếu lý do','Vui lòng nhập lý do mở lại công việc.','warning',4200);
    document.getElementById('reopen-task-reason')?.focus();
    return;
  }
  const toast=showToast('Đang mở lại công việc','Hệ thống đang chuyển công việc về Đang thực hiện và ghi lịch sử phản hồi.','processing',0);
  try{
    const res=await gas('reopenTask',id,reason,APP.token,{timeout:60000});
    mergeDataResult(res);closeModal();
    updateToast(toast,'Đã mở lại công việc','Công việc đã chuyển về Đang thực hiện. Lịch sử xác nhận trước đó vẫn được giữ.','success',3600);
    renderCurrentPage();
  }catch(err){updateToast(toast,'Không thể mở lại',err.message,'error',5000);}
}

/* ========================= KPI MODALS ========================= */
function openCreateKpiModal(){
  const period=formatPeriod(startOfMonth(new Date()));
  const body=`<div class="form-grid">${formField('kpiMonths','Mã nhân sự',comboHtml('Mã nhân sự','',personOptions(),'Tìm mã hoặc tên nhân sự...'),'Chọn nhân sự chưa có KPI trong kỳ.',false,true)}${formField('kpiMonths','Mã mẫu KPI',comboHtml('Mã mẫu KPI','',(APP.data.kpiTemplates||[]).filter(t=>t['Trạng thái']==='Đang áp dụng').map(t=>({value:t['Mã mẫu KPI'],label:`${t['Mã mẫu KPI']} - ${t['Tên mẫu KPI']}`})),'Tìm mẫu KPI...'),'Chọn bộ KPI đang áp dụng.',false,true)}${formField('kpiMonths','Kỳ',textInput('Kỳ',period,'MM/YYYY','text'),'Nhập kỳ theo định dạng MM/YYYY.',false,true)}</div>`;
  openModal(modalShell('Tạo KPI tháng','Hệ thống sao chép chỉ tiêu từ Mẫu KPI và tự tính các chỉ tiêu lấy từ công việc.',body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-kpi-create">Tạo KPI</button>`,'small'));
}
async function saveCreateKpiModal(){const f=collectForm();const t=showToast('Đang tạo KPI tháng','Đang tạo hồ sơ KPI và chỉ tiêu chi tiết.','processing',0);try{const res=await gas('createKpiMonth',f['Mã nhân sự'],f['Mã mẫu KPI'],f['Kỳ'],APP.token,{timeout:90000});mergeDataResult(res);closeModal();updateToast(t,'Đã tạo KPI tháng','Các chỉ tiêu tự động đã được tính từ công việc hiện có.','success',3500);renderCurrentPage();}catch(err){updateToast(t,'Không thể tạo KPI',err.message,'error',5500);}}
function openKpiEvaluationModal(id){
  const k=(APP.data.kpiMonths||[]).find(x=>x['Mã KPI tháng']===id); if(!k)return;
  const details=kpiDetails(id);
  const total=round1(k['Tổng điểm KPI']||0);
  const scoreWidth=Math.min(100,Number(total||0)/1.2);
  const manualCount=details.filter(d=>d['Nguồn số liệu']==='Nhóm tự nhập').length;
  const autoCount=details.length-manualCount;
  const cards=details.map(d=>{
    const isManual=d['Nguồn số liệu']==='Nhóm tự nhập';
    return `<article class="kpi-eval-card ${isManual?'manual':'auto'}">
      <div class="kpi-eval-card-head"><div><strong>${escapeHtml(d['Tên chỉ tiêu'])}</strong><small>${escapeHtml(d['Nhóm KPI'])} · ${escapeHtml(d['Nguồn số liệu'])}</small></div>${statusBadge(isManual?'Cần đánh giá':'Tự động')}</div>
      <div class="kpi-eval-metrics">
        <div class="kpi-eval-metric"><small>Mục tiêu</small><b>${round1(d['Mục tiêu'])} ${escapeHtml(d['Đơn vị tính'])}</b></div>
        <div class="kpi-eval-metric"><small>Thực tế</small><b>${round1(d['Thực tế'])}</b></div>
        <div class="kpi-eval-metric"><small>Điểm</small><b>${round1(d['Điểm chỉ tiêu'])}/120</b></div>
        <div class="kpi-eval-metric"><small>Quy đổi</small><b>${round1(d['Điểm quy đổi'])}</b></div>
      </div>
      <div class="progress"><span style="width:${Math.min(100,Number(d['Điểm chỉ tiêu']||0)/1.2)}%"></span></div>
      ${isManual?`<div class="kpi-eval-inputs"><input type="number" min="0" max="120" data-kpi-detail-id="${escapeAttr(d['Mã chi tiết KPI'])}" data-kpi-actual value="${escapeAttr(d['Thực tế']??0)}" placeholder="Nhập thực tế"><textarea data-kpi-detail-id="${escapeAttr(d['Mã chi tiết KPI'])}" data-kpi-comment placeholder="Nhận xét chỉ tiêu...">${escapeHtml(d['Nhận xét quản lý']||'')}</textarea></div>`:`<div class="kpi-auto-note"><span class="material-symbols-rounded" style="font-size:15px;vertical-align:-3px">auto_awesome</span> Chỉ tiêu này lấy tự động từ dữ liệu công việc, không chỉnh trực tiếp trong màn hình đánh giá.</div>`}
    </article>`;
  }).join('');
  const body=`<div class="kpi-eval-shell">
    <div class="kpi-score-hero">
      <div class="kpi-person-block">${avatarHtml(k['Mã nhân sự'],64)}<div><h2>${escapeHtml(employeeName(k['Mã nhân sự']))}</h2><p>Kỳ ${formatPeriod(k['Kỳ'])} · ${escapeHtml(findEmployee(k['Mã nhân sự'])?.['Nhóm']||'')} · ${statusBadge(k['Trạng thái KPI'])}</p><div style="margin-top:9px;display:flex;gap:6px;flex-wrap:wrap"><span class="badge badge-blue">${autoCount} tự động</span><span class="badge badge-orange">${manualCount} cần nhập</span><span class="badge badge-violet">Tối đa 120 điểm</span></div></div></div>
      <div class="kpi-score-panel"><small class="muted">Điểm KPI hiện tại</small><div class="kpi-score-number">${total}<small>/120</small></div><div class="progress" style="margin-top:10px"><span style="width:${scoreWidth}%"></span></div><div style="margin-top:9px">${statusBadge(k['Xếp loại']||'Chưa xếp loại')}</div></div>
    </div>
    <div class="kpi-eval-grid">${cards}</div>
    <div class="form-field"><label>Nhận xét tổng hợp</label><textarea id="kpi-overall-comment" placeholder="Nhận xét chung về kết quả KPI, điểm mạnh và nội dung cần cải thiện...">${escapeHtml(k['Nhận xét tổng hợp']||'')}</textarea><div class="field-help">Nhận xét này hiển thị trong hồ sơ KPI và báo cáo.</div></div>
    <input type="hidden" id="kpi-eval-id" value="${escapeAttr(id)}">
  </div>`;
  openModal(modalShell('Đánh giá KPI','Thiết kế mới theo dạng thẻ chỉ tiêu, dễ nhìn điểm, trọng số và phần cần nhập.',body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-kpi-evaluation"><span class="material-symbols-rounded">fact_check</span>Lưu đánh giá</button>`,'xwide'));
}
async function saveKpiEvaluationModal(){const id=document.getElementById('kpi-eval-id')?.value,comment=document.getElementById('kpi-overall-comment')?.value||'';const updates=[];document.querySelectorAll('[data-kpi-actual]').forEach(el=>{const detailId=el.dataset.kpiDetailId;const c=document.querySelector(`[data-kpi-comment][data-kpi-detail-id="${CSS.escape(detailId)}"]`);updates.push({id:detailId,actual:Number(el.value),comment:c?.value||''});});const t=showToast('Đang lưu đánh giá KPI','Hệ thống đang tính điểm quy đổi và tổng điểm.','processing',0);try{const res=await gas('evaluateKpi',id,updates,comment,APP.token,{timeout:90000});mergeDataResult(res);closeModal();updateToast(t,'Đã đánh giá KPI','Điểm và xếp loại đã được cập nhật.','success',3500);renderCurrentPage();}catch(err){updateToast(t,'Không thể đánh giá KPI',err.message,'error',5500);}}
function confirmFinalizeKpi(id){const k=(APP.data.kpiMonths||[]).find(x=>x['Mã KPI tháng']===id);if(!k)return;showConfirm('Chốt KPI','Sau khi chốt, KPI chuyển sang trạng thái chỉ đọc đối với quản lý. Điểm hiện tại: '+round1(k['Tổng điểm KPI']||0)+'/120.',async()=>{const t=showToast('Đang chốt KPI','Đang khóa kết quả KPI cuối kỳ.','processing',0);try{const res=await gas('finalizeKpi',id,APP.token,{timeout:60000});mergeDataResult(res);updateToast(t,'Đã chốt KPI','Kết quả KPI đã được khóa.','success',3500);renderCurrentPage();}catch(err){updateToast(t,'Không thể chốt KPI',err.message,'error',5000);}},'Chốt KPI');}

/* ========================= PROFILES ========================= */
function openProjectProfile(id){APP.state.profile={type:'project',id,tab:'overview'};renderProjectProfile(id,'overview');}
function renderProjectProfile(id,tab){const p=(APP.data.projects||[]).find(x=>x['Mã dự án']===id);if(!p)return;const tasks=(APP.data.tasks||[]).filter(t=>t['Mã dự án']===id),members=(APP.data.projectMembers||[]).filter(m=>m['Mã dự án']===id),files=filesFor('Dự án',id);let content='';if(tab==='tasks')content=renderTasksTable(tasks,'profileTasks',false);else if(tab==='members')content=`<div class="card-grid">${members.map(m=>`<div class="panel entity-card">${personInline(m['Mã nhân sự'])}<div style="margin-top:8px">${statusBadge(m['Vai trò tham gia'])} ${statusBadge(m['Trạng thái'])}</div></div>`).join('')}</div>`;else if(tab==='files')content=files.length?`<div class="file-list">${files.map(fileCard).join('')}</div>`:emptyState('folder_copy','Chưa có tài liệu','Tài liệu dự án sẽ hiển thị ở đây.');else content=`<div class="profile-hero"><div class="entity-icon"><span class="material-symbols-rounded">folder_open</span></div><div><h2>${escapeHtml(p['Tên dự án'])}</h2><p>${escapeHtml(p['Mã dự án'])} · ${escapeHtml(p['Loại dự án'])} · ${escapeHtml(employeeName(p['Mã người phụ trách']))}</p></div></div><div class="profile-stats"><div class="profile-stat"><small>Tiến độ</small><strong>${round1(p['Tiến độ (%)']||0)}%</strong></div><div class="profile-stat"><small>Công việc</small><strong>${tasks.length}</strong></div><div class="profile-stat"><small>Hoàn thành</small><strong>${tasks.filter(t=>t['Trạng thái']==='Hoàn thành').length}</strong></div><div class="profile-stat"><small>Quá hạn</small><strong class="text-danger">${tasks.filter(isTaskOverdue).length}</strong></div></div><div class="form-section" style="margin-top:10px"><div class="form-section-title">Thông tin chính</div><div class="form-grid cols-3"><div><small class="muted">Ngày bắt đầu</small><strong style="display:block">${formatDate(p['Ngày bắt đầu'])}</strong></div><div><small class="muted">Kết thúc dự kiến</small><strong style="display:block">${formatDate(p['Ngày dự kiến kết thúc'])}</strong></div><div><small class="muted">Trạng thái</small><div>${statusBadge(p['Trạng thái'])}</div></div><div class="full"><small class="muted">Mô tả</small><p>${escapeHtml(p['Mô tả']||'Chưa có mô tả.')}</p></div></div></div>`;
  openModal(`<div class="modal xwide"><div class="modal-head"><div><h2>Hồ sơ dự án</h2><p>Tổng hợp thông tin liên quan trong một hồ sơ.</p></div><button class="modal-close" data-action="close-modal"><span class="material-symbols-rounded">close</span></button></div>${profileTabs('project',id,tab,[['overview','Tổng quan'],['tasks','Công việc'],['members','Thành viên'],['files','Tài liệu']])}<div class="modal-body">${content}</div><div class="modal-footer">${APP.permissions.canManageProjects?`<button class="btn btn-primary" data-action="edit-project" data-id="${id}"><span class="material-symbols-rounded">edit</span>Chỉnh sửa</button>`:''}<button class="btn" data-action="close-modal">Đóng</button></div></div>`);
}
function openTaskProfile(id){APP.state.profile={type:'task',id,tab:'overview'};renderTaskProfile(id,'overview');}
function renderTaskProfile(id,tab){
  const t=(APP.data.tasks||[]).find(x=>x['Mã công việc']===id);
  if(!t)return;
  const participants=(APP.data.taskParticipants||[]).filter(p=>p['Mã công việc']===id),files=filesFor('Công việc',id);
  const approvalActions=new Set(['Xác nhận hoàn thành','Trả lại','Mở lại công việc']);
  const approvalHistory=(APP.data.audit||[])
    .filter(a=>a['Module']==='Công việc'&&String(a['Mã bản ghi'])===String(id)&&approvalActions.has(a['Hành động']))
    .sort((a,b)=>(parseDate(b['Thời gian'])?.getTime()||0)-(parseDate(a['Thời gian'])?.getTime()||0));
  let content;
  if(tab==='people'){
    content=`<div class="form-section"><div class="form-section-title">Người phụ trách chính</div>${personInline(t['Mã người phụ trách'])}</div><div class="form-section"><div class="form-section-title">Người tham gia</div>${participants.length?participants.map(p=>`<div class="action-card blue"><div class="action-card-icon">${avatarHtml(p['Mã nhân sự'],28)}</div><div><strong>${escapeHtml(employeeName(p['Mã nhân sự']))}</strong><p>${escapeHtml(p['Vai trò tham gia'])}</p></div>${statusBadge(p['Trạng thái'])}</div>`).join(''):emptyState('group','Chưa có người tham gia','Công việc hiện chỉ có người phụ trách chính.')}</div>`;
  }else if(tab==='files'){
    content=files.length?`<div class="file-list">${files.map(fileCard).join('')}</div>`:emptyState('attach_file','Chưa có tài liệu','File công việc sẽ hiển thị ở đây.');
  }else{
    const managerReview=t['Nhận xét quản lý']||'Chưa có nhận xét của quản lý.';
    const managerAction=t['Hành động quản lý']||'Chưa có';
    const managerDate=t['Ngày phản hồi quản lý']?formatDateTime(t['Ngày phản hồi quản lý']):'';
    const historyHtml=approvalHistory.length
      ? `<div class="form-section" style="margin-top:10px"><div class="form-section-title"><span class="material-symbols-rounded">history</span>Lịch sử xác nhận</div>${approvalHistory.map(a=>`<div class="action-card blue"><div class="action-card-icon"><span class="material-symbols-rounded">${a['Hành động']==='Xác nhận hoàn thành'?'verified':a['Hành động']==='Mở lại công việc'?'restart_alt':'undo'}</span></div><div><strong>${escapeHtml(a['Hành động'])}</strong><p>${escapeHtml(formatDateTime(a['Thời gian']))}${a['Nội dung thay đổi']?` · ${escapeHtml(a['Nội dung thay đổi'])}`:''}</p></div></div>`).join('')}</div>`
      : `<div class="form-section" style="margin-top:10px"><div class="form-section-title"><span class="material-symbols-rounded">history</span>Lịch sử xác nhận</div><p style="margin:0;color:var(--muted)">Chưa có lịch sử xác nhận, trả lại hoặc mở lại.</p></div>`;
    content=`<div class="profile-hero">${avatarHtml(t['Mã người phụ trách'],58)}<div><h2>${escapeHtml(t['Tên công việc'])}</h2><p>${escapeHtml(t['Mã công việc'])} · ${escapeHtml(projectName(t['Mã dự án']))} · ${escapeHtml(employeeName(t['Mã người phụ trách']))}</p></div></div>
    <div class="profile-stats"><div class="profile-stat"><small>Tiến độ</small><strong>${round1(t['Tiến độ (%)']||0)}%</strong></div><div class="profile-stat"><small>Ưu tiên</small><div style="margin-top:5px">${statusBadge(t['Mức độ ưu tiên'])}</div></div><div class="profile-stat"><small>Trạng thái</small><div style="margin-top:5px">${statusBadge(isTaskOverdue(t)?'Quá hạn':t['Trạng thái'])}</div></div><div class="profile-stat"><small>Hạn hoàn thành</small><strong style="font-size:14px">${formatDate(t['Hạn hoàn thành'])}</strong></div></div>
    <div class="form-section" style="margin-top:10px"><div class="form-section-title"><span class="material-symbols-rounded">description</span>Yêu cầu công việc</div><div class="task-rich-content">${safeRichHtml(t['Mô tả']||'Chưa có mô tả.')}</div>${t['Ghi chú']?`<div class="task-rich-content task-rich-note"><strong>Ghi chú chung:</strong>${safeRichHtml(t['Ghi chú'])}</div>`:''}</div>
    <div class="form-section" style="margin-top:10px"><div class="form-section-title"><span class="material-symbols-rounded">task_alt</span>Kết quả thực hiện</div><div class="task-rich-content">${safeRichHtml(t['Kết quả']||'Chưa cập nhật kết quả.')}</div></div>
    <div class="form-section" style="margin-top:10px"><div class="form-section-title"><span class="material-symbols-rounded">fact_check</span>Nhận xét của quản lý</div><p style="white-space:pre-wrap;margin:0">${escapeHtml(managerReview)}</p><p style="margin:8px 0 0;color:var(--muted)"><strong>Hành động gần nhất:</strong> ${escapeHtml(managerAction)}${managerDate?` · ${escapeHtml(managerDate)}`:''}</p></div>
    ${historyHtml}`;
  }

  let workflowButton='';
  if(t['Trạng thái']==='Chờ xác nhận'&&APP.permissions.canConfirmTask){
    workflowButton=`<button class="btn btn-success" data-action="confirm-task" data-id="${id}"><span class="material-symbols-rounded">fact_check</span>Xác nhận / Trả lại</button>`;
  }else if(t['Trạng thái']==='Hoàn thành'&&APP.permissions.canConfirmTask){
    workflowButton=`<button class="btn" data-action="reopen-task" data-id="${id}"><span class="material-symbols-rounded">restart_alt</span>Mở lại công việc</button>`;
  }else{
    workflowButton=`<button class="btn" data-action="task-status" data-id="${id}"><span class="material-symbols-rounded">sync_alt</span>Cập nhật trạng thái</button>`;
  }

  openModal(`<div class="modal xwide"><div class="modal-head"><div><h2>Hồ sơ công việc</h2><p>Thông tin, kết quả thực hiện, nhận xét quản lý, người tham gia và tài liệu.</p></div><button class="modal-close" data-action="close-modal"><span class="material-symbols-rounded">close</span></button></div>${profileTabs('task',id,tab,[['overview','Tổng quan'],['people','Người tham gia'],['files','Tài liệu']])}<div class="modal-body">${content}</div><div class="modal-footer">${workflowButton}${canEditTask(t)?`<button class="btn btn-primary" data-action="edit-task" data-id="${id}"><span class="material-symbols-rounded">edit</span>Chỉnh sửa</button>`:''}<button class="btn" data-action="close-modal">Đóng</button></div></div>`);
}
function openEmployeeProfile(id){renderEmployeeProfile(id,'overview');}
function renderEmployeeProfile(id,tab){const e=(APP.data.employees||[]).find(x=>x['Mã nhân sự']===id);if(!e)return;const tasks=(APP.data.tasks||[]).filter(t=>t['Mã người phụ trách']===id),projects=(APP.data.projects||[]).filter(p=>p['Mã người phụ trách']===id||(APP.data.projectMembers||[]).some(m=>m['Mã dự án']===p['Mã dự án']&&m['Mã nhân sự']===id)),kpis=(APP.data.kpiMonths||[]).filter(k=>k['Mã nhân sự']===id);let content;if(tab==='tasks')content=renderTasksTable(tasks,'empTasks',false);else if(tab==='projects')content=renderProjectsTable(projects,'empProjects',false);else if(tab==='kpi')content=renderKpiCards(kpis);else content=`<div class="profile-hero">${avatarHtml(id,58)}<div><h2>${escapeHtml(e['Họ và tên'])}</h2><p>${escapeHtml(e['Mã nhân sự'])} · ${escapeHtml(e['Chức vụ'])} · ${escapeHtml(e['Nhóm'])}</p></div></div><div class="profile-stats"><div class="profile-stat"><small>Công việc</small><strong>${tasks.length}</strong></div><div class="profile-stat"><small>Hoàn thành</small><strong>${tasks.filter(t=>t['Trạng thái']==='Hoàn thành').length}</strong></div><div class="profile-stat"><small>Dự án tham gia</small><strong>${projects.length}</strong></div><div class="profile-stat"><small>KPI gần nhất</small><strong>${kpis.length?round1([...kpis].sort((a,b)=>parseDate(b['Kỳ'])-parseDate(a['Kỳ']))[0]['Tổng điểm KPI'])+'%':'-'}</strong></div></div><div class="form-section" style="margin-top:10px"><div class="form-grid cols-3"><div><small class="muted">Email</small><strong style="display:block">${escapeHtml(e['Email']||'-')}</strong></div><div><small class="muted">Số điện thoại</small><strong style="display:block">${escapeHtml(formatPhone(e['Số điện thoại'])||'-')}</strong></div><div><small class="muted">Quản lý trực tiếp</small><strong style="display:block">${escapeHtml(employeeName(e['Mã quản lý trực tiếp'])||'-')}</strong></div></div></div>`;openModal(`<div class="modal xwide"><div class="modal-head"><div><h2>Hồ sơ nhân sự</h2><p>Tổng hợp công việc, dự án và KPI.</p></div><button class="modal-close" data-action="close-modal"><span class="material-symbols-rounded">close</span></button></div>${profileTabs('employee',id,tab,[['overview','Tổng quan'],['tasks','Công việc'],['projects','Dự án'],['kpi','KPI']])}<div class="modal-body">${content}</div><div class="modal-footer">${APP.permissions.canManageEmployees?`<button class="btn btn-primary" data-action="edit-employee" data-id="${id}"><span class="material-symbols-rounded">edit</span>Chỉnh sửa</button>`:''}<button class="btn" data-action="close-modal">Đóng</button></div></div>`);}
function openKpiProfile(id){const k=(APP.data.kpiMonths||[]).find(x=>x['Mã KPI tháng']===id);if(!k)return;const details=kpiDetails(id);const body=`<div class="profile-hero">${avatarHtml(k['Mã nhân sự'],58)}<div><h2>${escapeHtml(employeeName(k['Mã nhân sự']))}</h2><p>Kỳ ${formatPeriod(k['Kỳ'])} · ${statusBadge(k['Trạng thái KPI'])}</p></div></div><div class="profile-stats"><div class="profile-stat"><small>Điểm KPI</small><strong>${round1(k['Tổng điểm KPI']||0)}/120</strong></div><div class="profile-stat"><small>Xếp loại</small><div style="margin-top:5px">${statusBadge(k['Xếp loại']||'Chưa xếp loại')}</div></div><div class="profile-stat"><small>Ngày đánh giá</small><strong style="font-size:13px">${formatDate(k['Ngày đánh giá'])||'-'}</strong></div><div class="profile-stat"><small>Ngày chốt</small><strong style="font-size:13px">${formatDate(k['Ngày chốt'])||'-'}</strong></div></div><div class="data-table-wrap" style="margin-top:10px"><table class="data-table"><thead><tr><th>Chỉ tiêu</th><th>Mục tiêu</th><th>Thực tế</th><th>Điểm</th><th>Trọng số</th><th>Quy đổi</th><th>Nguồn</th></tr></thead><tbody>${details.map(d=>`<tr><td class="main-cell"><strong>${escapeHtml(d['Tên chỉ tiêu'])}</strong><small>${escapeHtml(d['Nhóm KPI'])}</small></td><td>${round1(d['Mục tiêu'])}</td><td>${round1(d['Thực tế'])}</td><td>${round1(d['Điểm chỉ tiêu'])}</td><td>${round1(d['Trọng số (%)'])}%</td><td><strong>${round1(d['Điểm quy đổi'])}</strong></td><td>${escapeHtml(d['Nguồn số liệu'])}</td></tr>`).join('')}</tbody></table></div><div class="form-section" style="margin-top:10px"><strong>Nhận xét tổng hợp</strong><p>${escapeHtml(k['Nhận xét tổng hợp']||'Chưa có nhận xét.')}</p></div>`;openModal(modalShell('Hồ sơ KPI',`${escapeHtml(k['Mã KPI tháng'])} · Điểm tối đa 120`,body,`${APP.permissions.canEvaluateKpi&&k['Trạng thái KPI']!=='Đã chốt'?`<button class="btn btn-primary" data-action="evaluate-kpi" data-id="${id}">Đánh giá</button>`:''}<button class="btn" data-action="close-modal">Đóng</button>`,'xwide'));}
function openKpiTemplateProfile(id){const t=(APP.data.kpiTemplates||[]).find(x=>x['Mã mẫu KPI']===id);if(!t)return;const details=(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===id);openModal(modalShell('Chi tiết mẫu KPI',t['Tên mẫu KPI'],`<div class="profile-hero"><div class="entity-icon"><span class="material-symbols-rounded">description</span></div><div><h2>${escapeHtml(t['Tên mẫu KPI'])}</h2><p>${escapeHtml(t['Phạm vi áp dụng'])}: ${escapeHtml(t['Giá trị áp dụng'])} · ${formatDate(t['Ngày hiệu lực'])}</p></div></div><div class="data-table-wrap" style="margin-top:10px"><table class="data-table"><thead><tr><th>Chỉ tiêu</th><th>Nhóm</th><th>Mục tiêu</th><th>Trọng số</th><th>Ghi nhận</th><th>Điểm tối đa</th></tr></thead><tbody>${details.map(d=>`<tr><td><strong>${escapeHtml(d['Tên chỉ tiêu'])}</strong></td><td>${escapeHtml(d['Nhóm KPI'])}</td><td>${round1(d['Mục tiêu mặc định'])} ${escapeHtml(d['Đơn vị tính'])}</td><td>${round1(d['Trọng số (%)'])}%</td><td>${escapeHtml(d['Cách ghi nhận'])}</td><td>${round1(d['Điểm tối đa'])}</td></tr>`).join('')}</tbody></table></div>`,`<button class="btn btn-primary" data-action="edit-template" data-id="${id}">Chỉnh sửa</button><button class="btn" data-action="close-modal">Đóng</button>`,'xwide'));}
function profileTabs(type,id,current,tabs){return `<div class="profile-tabs">${tabs.map(([key,label])=>`<button class="${key===current?'active':''}" data-action="profile-tab" data-type="${type}" data-id="${id}" data-tab="${key}">${label}</button>`).join('')}</div>`;}
function renderProfileTab(type,id,tab){if(type==='project')renderProjectProfile(id,tab);else if(type==='task')renderTaskProfile(id,tab);else if(type==='employee')renderEmployeeProfile(id,tab);}
function openMyProfile(){if(APP.session?.employeeId)openEmployeeProfile(APP.session.employeeId);}

/* ========================= UPLOAD / PREVIEW ========================= */
function uploadZoneHtml(hint){return `<div class="upload-zone" id="generic-upload-zone"><div class="upload-zone-icon"><span class="material-symbols-rounded">cloud_upload</span></div><div class="upload-zone-copy"><strong>Chọn file để đính kèm</strong><small>${escapeHtml(hint||'File chỉ được upload khi bấm Lưu.')}</small></div><button class="btn btn-sm" type="button" data-action="choose-upload-files">Chọn file</button><input id="generic-upload-input" type="file" multiple class="hidden"></div><div id="pending-file-list" class="pending-files">${renderPendingFiles()}</div>`;}
function setPendingFiles(files){
  APP.state.pendingFiles=mergeFileLists(APP.state.pendingFiles||[],files||[],20*1024*1024);
  const list=document.getElementById('pending-file-list');
  if(list)list.innerHTML=renderPendingFiles();
}
function renderPendingFiles(){if(!APP.state.pendingFiles.length)return '<span class="muted" style="font-size:11px">Chưa chọn file.</span>';return APP.state.pendingFiles.map((f,i)=>`<div class="file-chip"><div class="file-chip-icon"><span class="material-symbols-rounded">${fileIcon(f.type)}</span></div><div><strong>${escapeHtml(f.name)}</strong><small>${escapeHtml(f.type||'Không rõ loại')} · ${formatFileSize(f.size)}</small></div><div class="file-chip-actions">${f.type.startsWith('image/')?`<button class="row-action" data-action="preview-local-file" data-index="${i}"><span class="material-symbols-rounded">visibility</span></button>`:''}<button class="row-action danger" data-action="remove-pending-file" data-index="${i}"><span class="material-symbols-rounded">close</span></button></div></div>`).join('');}
function removePendingFile(index){APP.state.pendingFiles.splice(index,1);const list=document.getElementById('pending-file-list');if(list)list.innerHTML=renderPendingFiles();}
function previewLocalPending(index){const f=APP.state.pendingFiles[index];if(!f)return;if(f.type.startsWith('image/')){const url=URL.createObjectURL(f);openPreviewShell(f.name,f.type,`<img src="${url}" alt="Xem trước">`,()=>URL.revokeObjectURL(url));}else showToast('Không hỗ trợ xem trước cục bộ','File này sẽ được xem sau khi upload.','warning');}
function uploadRecordOptions(){
  return [
    ...(APP.data.projects||[]).map(x=>({value:x['Mã dự án'],label:`${x['Mã dự án']} - ${x['Tên dự án']}`})),
    ...(APP.data.tasks||[]).map(x=>({value:x['Mã công việc'],label:`${x['Mã công việc']} - ${x['Tên công việc']}`})),
    ...(APP.data.employees||[]).map(x=>({value:x['Mã nhân sự'],label:`${x['Mã nhân sự']} - ${x['Họ và tên']}`})),
    ...(APP.data.kpiMonths||[]).map(x=>({value:x['Mã KPI tháng'],label:`${x['Mã KPI tháng']} - ${employeeName(x['Mã nhân sự'])} - ${formatPeriod(x['Kỳ'])}`}))
  ];
}
function openTaskUploadModal(taskId){
  const id=String(taskId||'').trim();
  const task=(APP.data.tasks||[]).find(x=>String(x['Mã công việc']||'')===id);
  if(!task){showToast('Không tìm thấy công việc','Vui lòng mở lại hồ sơ công việc rồi thử lại.','error');return;}
  if(!(canEditTask(task)||APP.permissions.canManageProjects)){
    showToast('Không đủ quyền','Bạn không có quyền đính kèm tệp cho công việc này.','warning');return;
  }
  APP.state.uploadContext={module:'Công việc',recordId:id,returnToTaskId:id};
  openUploadModal(APP.state.uploadContext);
}
function openUploadModal(context=null){
  APP.state.pendingFiles=[];
  if(context) APP.state.uploadContext={...context};
  else APP.state.uploadContext=null;
  const ctx=APP.state.uploadContext;
  const moduleOptions=['Dự án','Công việc','KPI tháng'];
  const moduleValue=ctx?.module||'';
  const recordValue=ctx?.recordId||'';
  const body=`${ctx?.returnToTaskId?`<div class="action-card blue" style="margin-bottom:12px"><div class="action-card-icon"><span class="material-symbols-rounded">task_alt</span></div><div><strong>Đang đính kèm vào công việc</strong><p>${escapeHtml(ctx.returnToTaskId)} · ${escapeHtml((APP.data.tasks||[]).find(x=>String(x['Mã công việc']||'')===String(ctx.returnToTaskId))?.['Tên công việc']||'')}</p></div></div>`:''}<div class="form-grid">${formField('files','Module liên quan',comboHtml('Module liên quan',moduleValue,moduleOptions,'Chọn module'),'Chọn module hồ sơ cần liên kết.',false,true)}${formField('files','Mã bản ghi liên quan',comboHtml('Mã bản ghi liên quan',recordValue,uploadRecordOptions(),'Tìm mã hoặc tên hồ sơ...'),'Chọn đúng hồ sơ thuộc module đã chọn. Hệ thống kiểm tra lại quyền và liên kết khi upload.',false,true)}${formField('files','Loại tài liệu',comboHtml('Loại tài liệu','',(APP.data.categories?.['Loại tài liệu']||[]),'Tìm loại tài liệu...'),'Lấy từ Danh mục.',false,true)}${formField('files','Ghi chú',textInput('Ghi chú','','Ghi chú tài liệu'),'Không bắt buộc.')}${formField('files','File',uploadZoneHtml('Có thể chọn nhiều file. File chưa được gửi lên Drive ở bước này.'),'Kiểm tra tên, loại và dung lượng trước khi upload.',true,true)}</div>`;
  openModal(modalShell(ctx?.returnToTaskId?'Đính kèm tệp vào công việc':'Upload tài liệu','File được lưu trên Google Drive và metadata ghi vào tab Tài liệu.',body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-upload"><span class="material-symbols-rounded">cloud_upload</span>Upload</button>`,'wide'));
}
async function saveUploadModal(){
  const f=collectForm();
  const ctx=APP.state.uploadContext;
  // Context set from the task profile is authoritative: do not let the file
  // accidentally be linked to another record from the generic selector.
  const moduleLabel=ctx?.returnToTaskId?'Công việc':f['Module liên quan'];
  const recordId=ctx?.returnToTaskId?ctx.returnToTaskId:f['Mã bản ghi liên quan'];
  if(!moduleLabel||!recordId||!f['Loại tài liệu']){
    showToast('Thiếu thông tin','Vui lòng chọn module, mã hồ sơ và loại tài liệu.','error');return;
  }
  if(!APP.state.pendingFiles.length){
    showToast('Chưa chọn file','Vui lòng chọn ít nhất một file.','warning');return;
  }
  const fileCount=APP.state.pendingFiles.length;
  const pending=[...APP.state.pendingFiles];
  const t=showToast('Đang tải file lên',`0/${fileCount} file. Bạn có thể chờ trong cửa sổ này.`,'processing',0);
  try{
    for(let i=0;i<pending.length;i++){
      updateToast(t,'Đang tải file lên',`${i+1}/${pending.length}: ${pending[i].name}`,'processing',0);
      await uploadOneFile(pending[i],moduleLabel,recordId,f['Loại tài liệu'],f['Ghi chú']);
    }
    closeModal();
    updateToast(t,'Upload thành công',`${fileCount} file đã được lưu và liên kết ${ctx?.returnToTaskId?'trực tiếp với công việc':'hồ sơ'}${ctx?.returnToTaskId?' '+ctx.returnToTaskId:''}.`,'success',4000);
    if(ctx?.returnToTaskId){
      APP.state.uploadContext=null;
      renderTaskProfile(ctx.returnToTaskId,'files');
    }else{
      APP.state.uploadContext=null;
      renderCurrentPage();
    }
  }catch(err){
    updateToast(t,'Upload thất bại',err.message,'error',6500);
  }
}
async function uploadPendingFiles(moduleLabel,recordId){for(const f of APP.state.pendingFiles){await uploadOneFile(f,moduleLabel,recordId,(APP.data.categories?.['Loại tài liệu']||[])[0]||'Tài liệu khác','');}}
async function uploadOneFile(file,moduleLabel,recordId,documentType='Tài liệu khác',note=''){
  if(!file)return null;
  const dataUrl=await fileToBase64(file);
  const payload={fileName:file.name,mimeType:file.type||'application/octet-stream',fileSize:file.size,dataUrl,moduleLabel,recordId,documentType,note};
  const res=await gas('saveUploadedFileFast',payload,APP.token,{timeout:120000});
  if(res?.file){
    APP.data.files=APP.data.files||[];
    APP.data.files=APP.data.files.filter(f=>f['Mã tài liệu']!==res.file['Mã tài liệu']);
    APP.data.files.push(res.file);
  }else{
    mergeDataResult(res);
  }
  return res;
}
function fileToBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Không thể đọc file '+file.name+'.'));reader.readAsDataURL(file);});}


/* ========================= QUICK FLOW — THÊM NHANH THEO LUỒNG ========================= */
const QuickFlow = {
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  ACCEPT: '.png,.jpg,.jpeg,.pdf,.docx,.xlsx',

  state(){ return APP.state.quickFlow; },

  open(){
    if(!(APP.permissions.canManageProjects && APP.permissions.canCreateTask)){
      showToast('Không đủ quyền','Tính năng Thêm nhanh yêu cầu quyền tạo Dự án và Công việc.','warning');
      return;
    }
    const current=this.state();
    if(current?.submitting){
      showToast('Đang xử lý','Luồng thêm nhanh đang được lưu. Vui lòng theo dõi toast tiến độ.','processing',3000);
      return;
    }
    if(!current){
      APP.state.quickFlow={step:1,projects:[],tasks:[],submitting:false,__seq:0};
      APP.state.quickFlow.projects.push(this.blankProject());
    }
    this.render();
  },

  close(){
    const q=this.state();
    if(q?.submitting){
      document.getElementById('modal-root').innerHTML='';
      closeComboMenu();
      return;
    }
    APP.state.quickFlow=null;
    document.getElementById('modal-root').innerHTML='';
    closeComboMenu();
  },

  uid(prefix){
    const q=this.state();
    q.__seq=(q.__seq||0)+1;
    return `${prefix}_${String(q.__seq).padStart(3,'0')}_${Date.now().toString(36).slice(-4)}`;
  },

  blankProject(){
    const q=APP.state.quickFlow || {__seq:0};
    q.__seq=(q.__seq||0)+1;
    if(APP.state.quickFlow)APP.state.quickFlow.__seq=q.__seq;
    const today=toDateInput(new Date());
    const end=new Date(); end.setDate(end.getDate()+30);
    return {
      __tempId:`QF_PROJECT_${String(q.__seq).padStart(3,'0')}`,
      __expanded:true,__taskGroupExpanded:true,__files:[],__members:[],__errors:[],__fieldErrors:{},__uploadedFileKeys:[],__savedId:'',__membersSaved:false,
      'Tên dự án':'','Loại dự án':'','Mã người phụ trách':'','Ngày bắt đầu':today,'Ngày dự kiến kết thúc':toDateInput(end),
      'Trạng thái':'Chưa bắt đầu','Mức độ ưu tiên':'Bình thường','Tiến độ (%)':0,'Mô tả':'','Ghi chú':''
    };
  },

  blankTask(projectTempId=''){
    const q=this.state();
    q.__seq=(q.__seq||0)+1;
    const today=toDateInput(new Date());
    const due=new Date(); due.setDate(due.getDate()+7);
    return {
      __tempId:`QF_TASK_${String(q.__seq).padStart(3,'0')}`,
      __projectTempId:projectTempId||q.projects?.[0]?.__tempId||'',
      __expanded:true,__files:[],__participants:[],__errors:[],__fieldErrors:{},__uploadedFileKeys:[],__savedId:'',__participantsSaved:false,
      'Tên công việc':'','Nhóm công việc':'','Mã người phụ trách':'','Ngày bắt đầu':today,'Hạn hoàn thành':toDateInput(due),
      'Mức độ ưu tiên':'Bình thường','Trạng thái':'Chưa bắt đầu','Tiến độ (%)':0,'Trọng số công việc':1,'Mô tả':'','Kết quả':'','Ghi chú':''
    };
  },

  setStep(step){
    const q=this.state(); if(!q||q.submitting)return;
    const next=clamp(Number(step)||1,1,3);
    if(q.step===1)this.syncProjects();
    if(q.step===2)this.syncTasks();
    if(next>=2)this.ensureTaskGroups();
    q.step=next;
    if(next===3){this.validateProjects(false);this.validateTasks(false);}
    this.render();
  },

  next(){
    const q=this.state(); if(!q||q.submitting)return;
    if(q.step===1){
      this.syncProjects();
      const errors=this.validateProjects(true);
      if(errors.length)return this.validationFailed(errors,'Dự án');
      this.ensureTaskGroups();
      q.step=2; this.render(); return;
    }
    if(q.step===2){
      this.syncTasks();
      const errors=this.validateTasks(true);
      if(errors.length)return this.validationFailed(errors,'Công việc');
      this.validateProjects(false);
      q.step=3; this.render(); return;
    }
  },

  back(){
    const q=this.state(); if(!q||q.submitting)return;
    if(q.step===2)this.syncTasks();
    q.step=Math.max(1,q.step-1); this.render();
  },

  validationFailed(errors,label){
    this.render();
    showToast('Chưa thể tiếp tục',`${label}: ${errors[0]||'Vui lòng kiểm tra dữ liệu bắt buộc.'}`,'error',5500);
    requestAnimationFrame(()=>document.querySelector('#modal-root .qf-invalid')?.scrollIntoView({behavior:'smooth',block:'center'}));
  },

  addRows(kind,count=1,projectTempId=''){
    const q=this.state(); if(!q||q.submitting)return;
    if(kind==='project'){
      this.syncProjects();
      for(let i=0;i<count;i++)q.projects.push(this.blankProject());
    }else{
      this.syncTasks();
      const target=projectTempId || q.projects?.[0]?.__tempId || '';
      if(!target){
        showToast('Chưa có dự án','Hãy tạo ít nhất một dự án trước khi thêm công việc.','warning');
        return;
      }
      const project=q.projects.find(p=>p.__tempId===target);
      if(project)project.__taskGroupExpanded=true;
      for(let i=0;i<count;i++)q.tasks.push(this.blankTask(target));
    }
    this.render();
  },

  removeEmpty(kind){
    const q=this.state(); if(!q||q.submitting)return;
    if(kind==='project'){
      this.syncProjects();
      const removed=new Set(q.projects.filter(r=>this.isProjectEmpty(r)).map(r=>r.__tempId));
      q.projects=q.projects.filter(r=>!removed.has(r.__tempId));
      q.tasks=q.tasks.filter(t=>!removed.has(t.__projectTempId));
      if(!q.projects.length)q.projects=[this.blankProject()];
      this.ensureTaskGroups();
    }else{
      this.syncTasks();
      q.tasks=q.tasks.filter(r=>!this.isTaskEmpty(r));
    }
    this.render();
  },

  isProjectEmpty(r){
    return !String(r['Tên dự án']||'').trim()&&!String(r['Loại dự án']||'').trim()&&!String(r['Mã người phụ trách']||'').trim()&&!(r.__members||[]).length&&!(r.__files||[]).length&&!String(r['Mô tả']||'').trim()&&!String(r['Ghi chú']||'').trim();
  },

  isTaskEmpty(r){
    return !String(r['Tên công việc']||'').trim()&&!String(r['Nhóm công việc']||'').trim()&&!String(r['Mã người phụ trách']||'').trim()&&!(r.__participants||[]).length&&!(r.__files||[]).length&&!String(r['Mô tả']||'').trim()&&!String(r['Kết quả']||'').trim()&&!String(r['Ghi chú']||'').trim();
  },

  setExpanded(kind,value){
    const q=this.state(); if(!q||q.submitting)return;
    if(kind==='project')this.syncProjects(); else this.syncTasks();
    const expanded=Boolean(value);
    (kind==='project'?q.projects:q.tasks).forEach(r=>r.__expanded=expanded);
    if(kind==='task')q.projects.forEach(p=>p.__taskGroupExpanded=expanded);
    this.render();
  },

  ensureTaskGroups(){
    const q=this.state(); if(!q)return;
    q.projects.forEach(p=>{
      if(typeof p.__taskGroupExpanded!=='boolean')p.__taskGroupExpanded=true;
    });
    const ids=new Set(q.projects.map(p=>p.__tempId));
    q.tasks=q.tasks.filter(t=>ids.has(t.__projectTempId));
  },

  toggleProjectTasks(projectTempId){
    const q=this.state(); if(!q||q.submitting)return;
    this.syncTasks();
    const project=q.projects.find(p=>p.__tempId===projectTempId); if(!project)return;
    project.__taskGroupExpanded=project.__taskGroupExpanded===false;
    this.render();
  },

  rowAction(kind,tempId,action){
    const q=this.state(); if(!q||q.submitting)return;
    if(kind==='project')this.syncProjects(); else this.syncTasks();
    const rows=kind==='project'?q.projects:q.tasks;
    const idx=rows.findIndex(r=>r.__tempId===tempId); if(idx<0)return;
    const row=rows[idx];
    if(action==='toggle')row.__expanded=!row.__expanded;
    if(action==='delete'){
      rows.splice(idx,1);
      if(kind==='project')q.tasks=q.tasks.filter(t=>t.__projectTempId!==tempId);
    }
    if(action==='duplicate'){
      const copy={...row,__tempId:kind==='project'?this.uid('QF_PROJECT'):this.uid('QF_TASK'),__expanded:true,__taskGroupExpanded:true,__errors:[],__fieldErrors:{},__savedId:'',__files:[...(row.__files||[])],__uploadedFileKeys:[],__membersSaved:false,__participantsSaved:false};
      if(kind==='project')copy.__members=[...(row.__members||[])]; else copy.__participants=[...(row.__participants||[])];
      rows.splice(idx+1,0,copy);
    }
    if(!rows.length)rows.push(kind==='project'?this.blankProject():this.blankTask(q.projects?.[0]?.__tempId||''));
    this.render();
  },

  triggerFile(kind,tempId){
    document.querySelector(`#modal-root input[data-quick-file="${kind}"][data-qf-tempid="${CSS.escape(tempId)}"]`)?.click();
  },

  removeFile(kind,tempId,index){
    const row=this.findRow(kind,tempId); if(!row||this.state()?.submitting)return;
    row.__files.splice(index,1); this.render();
  },

  findRow(kind,tempId){
    const q=this.state(); if(!q)return null;
    return (kind==='project'?q.projects:q.tasks).find(r=>r.__tempId===tempId)||null;
  },

  handleInput(e){
    const display=e.target.closest?.('.combo-display');
    const qfCombo=display?.closest?.('[data-qf-combo]');
    if(qfCombo){
      const hidden=qfCombo.querySelector('input[type="hidden"][data-quick-field]');
      if(hidden){
        const selected=[...qfCombo.querySelectorAll('.combo-source [data-value]')].find(x=>String(x.dataset.value)===String(hidden.value||''));
        if(!selected || String(selected.dataset.label||'')!==String(display.value||'')){
          hidden.value='';
          const row=this.findRow(hidden.dataset.qfKind,hidden.dataset.qfTempid);
          if(row){if(hidden.dataset.quickField==='__projectTempId')row.__projectTempId='';else row[hidden.dataset.quickField]='';}
        }
      }
      return false;
    }
    const el=e.target.closest?.('[data-quick-field]');
    if(!el)return false;
    const row=this.findRow(el.dataset.qfKind,el.dataset.qfTempid); if(!row)return true;
    const field=el.dataset.quickField;
    let value=el.value;
    if(field==='Tiến độ (%)')value=clamp(Number(value||0),0,100);
    if(field==='__projectTempId')row.__projectTempId=value; else row[field]=value;
    if(row.__fieldErrors?.[field])delete row.__fieldErrors[field];
    this.updateSummary(el.dataset.qfKind,row);
    return true;
  },

  handleChange(e){
    const field=e.target.closest?.('[data-quick-field]');
    if(field){this.handleInput(e);return true;}
    const fileInput=e.target.closest?.('[data-quick-file]');
    if(fileInput){
      const row=this.findRow(fileInput.dataset.quickFile,fileInput.dataset.qfTempid); if(!row)return true;
      const incoming=[...(fileInput.files||[])];
      row.__files=mergeFileLists(row.__files||[],incoming,this.MAX_FILE_SIZE).filter(f=>this.isAcceptedFile(f));
      fileInput.value='';
      this.render(); return true;
    }
    const person=e.target.closest?.('[data-qf-person]');
    const allPeople=e.target.closest?.('[data-qf-all]');
    if(person||allPeople){
      const kind=(person||allPeople).dataset.qfPerson||(person||allPeople).dataset.qfAll;
      const tempid=(person||allPeople).dataset.qfTempid;
      const row=this.findRow(kind,tempid); if(!row)return true;
      if(allPeople){
        const list=`#modal-root input[data-qf-person="${kind}"][data-qf-tempid="${CSS.escape(tempid)}"]`;
        document.querySelectorAll(list).forEach(cb=>{cb.checked=allPeople.checked;});
      }
      const selector=`#modal-root input[data-qf-person="${kind}"][data-qf-tempid="${CSS.escape(tempid)}"]:checked`;
      const values=[...document.querySelectorAll(selector)].map(x=>x.value);
      const allBox=document.querySelector(`#modal-root input[data-qf-all="${kind}"][data-qf-tempid="${CSS.escape(tempid)}"]`);
      if(allBox){const boxes=[...document.querySelectorAll(`#modal-root input[data-qf-person="${kind}"][data-qf-tempid="${CSS.escape(tempid)}"]`)];allBox.checked=boxes.length>0&&boxes.every(cb=>cb.checked);}
      if(kind==='project')row.__members=[...new Set(values)]; else row.__participants=[...new Set(values)];
      this.updateSummary(kind,row); return true;
    }
    return false;
  },

  isAcceptedFile(file){
    if(!file)return false;
    const ext=(file.name.split('.').pop()||'').toLowerCase();
    const ok=['png','jpg','jpeg','pdf','docx','xlsx'].includes(ext);
    if(!ok)showToast('Không hỗ trợ loại file',`${file.name}: chỉ nhận PNG, JPG, PDF, DOCX, XLSX.`,'warning',4500);
    return ok;
  },

  updateSummary(kind,row){
    const root=document.getElementById('modal-root'); if(!root)return;
    const title=root.querySelector(`[data-qf-summary-title="${CSS.escape(row.__tempId)}"]`);
    if(title)title.textContent=kind==='project'?(row['Tên dự án']||'Dự án chưa đặt tên'):(row['Tên công việc']||'Công việc chưa đặt tên');
    const count=root.querySelector(`[data-qf-summary-count="${CSS.escape(row.__tempId)}"]`);
    if(count)count.textContent=kind==='project'?`${(row.__members||[]).length} thành viên · ${(row.__files||[]).length} file`:`${(row.__participants||[]).length} người tham gia · ${(row.__files||[]).length} file`;
  },

  syncProjects(){
    const q=this.state(); if(!q)return;
    document.querySelectorAll('#modal-root [data-qf-kind="project"][data-quick-field]').forEach(el=>{
      const row=q.projects.find(r=>r.__tempId===el.dataset.qfTempid); if(!row)return;
      const field=el.dataset.quickField;
      row[field]=field==='Tiến độ (%)'?clamp(Number(el.value||0),0,100):el.value;
    });
  },

  syncTasks(){
    const q=this.state(); if(!q)return;
    document.querySelectorAll('#modal-root [data-qf-kind="task"][data-quick-field]').forEach(el=>{
      const row=q.tasks.find(r=>r.__tempId===el.dataset.qfTempid); if(!row)return;
      const field=el.dataset.quickField;
      if(field==='__projectTempId')row.__projectTempId=el.value;
      else if(field==='Tiến độ (%)')row[field]=clamp(Number(el.value||0),0,100);
      else if(field==='Trọng số công việc')row[field]=Number(el.value||1);
      else row[field]=el.value;
    });
  },

  validateProjects(store=true){
    const q=this.state(); if(!q)return ['Chưa mở luồng thêm nhanh.'];
    const all=[];
    q.projects.forEach((r,i)=>{
      const fieldErrors={}; const req=['Tên dự án','Loại dự án','Mã người phụ trách','Ngày bắt đầu','Ngày dự kiến kết thúc','Trạng thái','Mức độ ưu tiên'];
      req.forEach(f=>{if(!String(r[f]??'').trim())fieldErrors[f]='Bắt buộc';});
      const start=parseDate(r['Ngày bắt đầu']),end=parseDate(r['Ngày dự kiến kết thúc']);
      if(start&&end&&end<start)fieldErrors['Ngày dự kiến kết thúc']='Ngày kết thúc phải từ ngày bắt đầu trở đi.';
      const progress=Number(r['Tiến độ (%)']); if(!Number.isFinite(progress)||progress<0||progress>100)fieldErrors['Tiến độ (%)']='Tiến độ phải từ 0 đến 100.';
      const errors=Object.entries(fieldErrors).map(([f,m])=>`Dự án #${i+1}: ${f} — ${m}`);
      if(store){r.__fieldErrors=fieldErrors;r.__errors=errors;}
      all.push(...errors);
    });
    return all;
  },

  validateTasks(store=true){
    const q=this.state(); if(!q)return ['Chưa mở luồng thêm nhanh.'];
    const projectIds=new Set(q.projects.map(p=>p.__tempId)); const all=[];
    q.tasks.forEach((r,i)=>{
      const fieldErrors={}; const req=['Tên công việc','Nhóm công việc','Mã người phụ trách','Ngày bắt đầu','Hạn hoàn thành','Mức độ ưu tiên','Trạng thái'];
      req.forEach(f=>{if(!String(r[f]??'').trim())fieldErrors[f]='Bắt buộc';});
      if(!r.__projectTempId||!projectIds.has(r.__projectTempId))fieldErrors['__projectTempId']='Chưa chọn dự án thuộc luồng này.';
      const start=parseDate(r['Ngày bắt đầu']),due=parseDate(r['Hạn hoàn thành']);
      if(start&&due&&due<start)fieldErrors['Hạn hoàn thành']='Hạn hoàn thành phải từ ngày bắt đầu trở đi.';
      const progress=Number(r['Tiến độ (%)']); if(!Number.isFinite(progress)||progress<0||progress>100)fieldErrors['Tiến độ (%)']='Tiến độ phải từ 0 đến 100.';
      const taskWeight=Number(r['Trọng số công việc']??1); if(!Number.isFinite(taskWeight)||taskWeight<=0||taskWeight>10)fieldErrors['Trọng số công việc']='Trọng số phải lớn hơn 0 và không vượt quá 10.';
      const errors=Object.entries(fieldErrors).map(([f,m])=>`Công việc #${i+1}: ${f==='__projectTempId'?'Dự án':f} — ${m}`);
      if(store){r.__fieldErrors=fieldErrors;r.__errors=errors;}
      all.push(...errors);
    });
    return all;
  },

  render(){
    const q=this.state(); if(!q)return;
    closeComboMenu();
    const body=`${this.renderStepBar()}<div class="qf-stage">${q.step===1?this.renderProjects():q.step===2?this.renderTasks():this.renderReview()}</div>`;
    const footer=this.renderFooter();
    const html=`<div class="modal xwide qf-modal"><div class="modal-head"><div><h2>THÊM NHANH THEO LUỒNG</h2><p>Tạo dự án và các công việc thuộc dự án trong một luồng nhập liệu thống nhất.</p></div><button class="modal-close" data-action="quick-flow-close" aria-label="Đóng"><span class="material-symbols-rounded">close</span></button></div><div class="modal-body">${body}</div><div class="modal-footer qf-footer">${footer}</div></div>`;
    openModal(html);
  },

  renderStepBar(){
    const q=this.state();
    const steps=[[1,'Tạo dự án'],[2,'Thêm công việc'],[3,'Kiểm tra thông tin']];
    return `<div class="qf-stepbar">${steps.map(([n,label])=>`<button type="button" class="qf-step ${q.step===n?'active':q.step>n?'completed':''}" data-action="quick-flow-step" data-step="${n}"><span class="qf-step-number">${n}</span><span>${label}</span></button>`).join('<span class="qf-step-line"></span>')}</div>`;
  },

  renderFooter(){
    const q=this.state();
    const left=`<span class="qf-footer-note">Có thể bấm trực tiếp vào số bước để chuyển bước.</span>`;
    if(q.step===1)return `${left}<div class="qf-footer-actions"><button class="btn" data-action="quick-flow-close">Hủy</button><button class="btn btn-primary" data-action="quick-flow-next">Tiếp tục <span class="material-symbols-rounded">arrow_forward</span></button></div>`;
    if(q.step===2)return `${left}<div class="qf-footer-actions"><button class="btn" data-action="quick-flow-back"><span class="material-symbols-rounded">arrow_back</span>Quay lại</button><button class="btn btn-primary" data-action="quick-flow-next">Tiếp tục <span class="material-symbols-rounded">arrow_forward</span></button></div>`;
    return `${left}<div class="qf-footer-actions"><button class="btn" data-action="quick-flow-back"><span class="material-symbols-rounded">arrow_back</span>Quay lại</button><button class="btn btn-primary" data-action="quick-flow-save" ${q.submitting?'disabled':''}><span class="material-symbols-rounded">save</span>Lưu tất cả</button></div>`;
  },

  renderToolbar(kind,count){
    const addAction=kind==='project'?'quick-flow-add-project':'quick-flow-add-task';
    return `<div class="qf-toolbar"><div class="qf-toolbar-left"><button class="btn btn-sm" data-action="${addAction}" data-count="1"><span class="material-symbols-rounded">add</span>Thêm 1 bản ghi</button><button class="btn btn-sm" data-action="${addAction}" data-count="5"><span class="material-symbols-rounded">playlist_add</span>Thêm 5 bản ghi</button><button class="btn btn-sm" data-action="quick-flow-remove-empty" data-kind="${kind}"><span class="material-symbols-rounded">delete_sweep</span>Xóa bản ghi trống</button><button class="btn btn-sm" data-action="quick-flow-collapse-all" data-kind="${kind}"><span class="material-symbols-rounded">unfold_less</span>Thu gọn tất cả</button><button class="btn btn-sm" data-action="quick-flow-expand-all" data-kind="${kind}"><span class="material-symbols-rounded">unfold_more</span>Mở rộng tất cả</button></div><span class="badge badge-gray">${count} bản ghi</span></div>`;
  },

  renderProjects(){
    const q=this.state();
    return `<section class="qf-intro"><div class="qf-intro-icon"><span class="material-symbols-rounded">folder_open</span></div><div><strong>Tạo dự án</strong><p>Nhập một hoặc nhiều dự án theo dạng thẻ. Mỗi dự án có thể chọn thành viên và tài liệu riêng.</p></div></section>${this.renderToolbar('project',q.projects.length)}<div class="qf-list">${q.projects.map((r,i)=>this.projectCard(r,i)).join('')}</div>`;
  },

  projectCard(r,i){
    const owner=employeeName(r['Mã người phụ trách'])||'Chưa chọn người phụ trách';
    return `<article class="qf-card ${r.__expanded?'':'is-collapsed'}" data-qf-card="${escapeAttr(r.__tempId)}"><header class="qf-card-head"><span class="qf-index">${i+1}</span><div class="qf-card-title"><strong data-qf-summary-title="${escapeAttr(r.__tempId)}">${escapeHtml(r['Tên dự án']||'Dự án chưa đặt tên')}</strong><small>${escapeHtml(owner)} · ${formatDate(r['Ngày bắt đầu'])||'--/--/----'} → ${formatDate(r['Ngày dự kiến kết thúc'])||'--/--/----'} · ${escapeHtml(r['Trạng thái']||'Chưa bắt đầu')}</small></div><div class="qf-head-badges"><span class="badge badge-gray" data-qf-summary-count="${escapeAttr(r.__tempId)}">${(r.__members||[]).length} thành viên · ${(r.__files||[]).length} file</span>${statusBadge(r['Trạng thái']||'Chưa bắt đầu')}</div><div class="row-actions"><button class="row-action" data-action="quick-flow-toggle-row" data-kind="project" data-tempid="${escapeAttr(r.__tempId)}" title="${r.__expanded?'Thu gọn':'Mở rộng'}"><span class="material-symbols-rounded">${r.__expanded?'expand_less':'expand_more'}</span></button><button class="row-action" data-action="quick-flow-duplicate-row" data-kind="project" data-tempid="${escapeAttr(r.__tempId)}" title="Nhân bản"><span class="material-symbols-rounded">content_copy</span></button><button class="row-action danger" data-action="quick-flow-delete-row" data-kind="project" data-tempid="${escapeAttr(r.__tempId)}" title="Xóa"><span class="material-symbols-rounded">delete</span></button></div></header>${r.__expanded?`<div class="qf-card-body"><div class="qf-grid qf-project-grid">${this.field(r,'project','Tên dự án','text','Nhập tên dự án ngắn gọn và dễ hiểu.',true,'Nhập tên dự án nổi bật, dễ nhận biết trong bảng công việc và báo cáo.','qf-span-2')}${this.comboField(r,'project','Loại dự án',categoryOptions('Loại dự án'),'Chọn loại dự án',true,'Lấy từ Danh mục Loại dự án.')}${this.comboField(r,'project','Mã người phụ trách',personOptions(),'Tìm kiếm và chọn người phụ trách...',true,'Người chịu trách nhiệm chính cho dự án.')}${this.field(r,'project','Ngày bắt đầu','date','',true,'Ngày bắt đầu kế hoạch của dự án.')}${this.field(r,'project','Ngày dự kiến kết thúc','date','',true,'Hạn hoàn thành dự kiến của dự án.')}${this.comboField(r,'project','Trạng thái',fixedOptions('projectStatus'),'Chọn trạng thái',true,'Trạng thái lõi dùng cho Dashboard và báo cáo.')}${this.comboField(r,'project','Mức độ ưu tiên',fixedOptions('priority'),'Chọn mức độ ưu tiên',true,'Dùng để cảnh báo và ưu tiên xử lý dự án.')}${this.field(r,'project','Tiến độ (%)','number','0',false,'Mặc định 0; hệ thống sẽ tiếp tục cập nhật theo công việc thuộc dự án.','','min="0" max="100"')}${this.textareaField(r,'project','Mô tả','Mô tả mục tiêu, phạm vi và đầu ra mong đợi của dự án...','Mô tả phạm vi và mục tiêu hoặc kết quả mong đợi.','qf-span-2')}${this.textareaField(r,'project','Ghi chú','Thông tin bổ sung...','Thông tin bổ sung không ảnh hưởng tính toán.')}</div><div class="qf-lower-grid"><section class="qf-subpanel"><div class="qf-subpanel-title"><span>Thành viên tham gia</span><span class="badge badge-gray">${(r.__members||[]).length}</span></div>${this.personPicker('project',r)}</section><section class="qf-subpanel"><div class="qf-subpanel-title"><span>Tài liệu dự án</span><span class="badge badge-gray">${(r.__files||[]).length}</span></div>${this.filePicker('project',r)}</section></div>${this.rowErrors(r)}</div>`:''}</article>`;
  },

  renderTasks(){
    const q=this.state();
    this.ensureTaskGroups();
    return `<section class="qf-intro"><div class="qf-intro-icon"><span class="material-symbols-rounded">account_tree</span></div><div><strong>Thêm công việc theo từng dự án</strong><p>Mỗi dự án ở bước 1 có một khu vực riêng. Bấm “Thêm công việc” ngay tại dự án để tạo các việc con đúng dự án đó.</p></div></section>${this.renderTaskToolbar()}<div class="qf-task-projects">${q.projects.map((p,i)=>this.taskProjectGroup(p,i)).join('')}</div>`;
  },

  renderTaskToolbar(){
    const q=this.state();
    return `<div class="qf-toolbar qf-task-toolbar"><div class="qf-toolbar-left"><button class="btn btn-sm" data-action="quick-flow-remove-empty" data-kind="task"><span class="material-symbols-rounded">delete_sweep</span>Xóa bản ghi trống</button><button class="btn btn-sm" data-action="quick-flow-collapse-all" data-kind="task"><span class="material-symbols-rounded">unfold_less</span>Thu gọn tất cả</button><button class="btn btn-sm" data-action="quick-flow-expand-all" data-kind="task"><span class="material-symbols-rounded">unfold_more</span>Mở rộng tất cả</button></div><span class="badge badge-gray">${q.projects.length} dự án · ${q.tasks.length} công việc</span></div>`;
  },

  taskProjectGroup(project,projectIndex){
    const q=this.state();
    const tasks=q.tasks.filter(t=>t.__projectTempId===project.__tempId);
    const owner=employeeName(project['Mã người phụ trách'])||'Chưa chọn người phụ trách';
    const expanded=project.__taskGroupExpanded!==false;
    const taskHtml=tasks.map((task,childIndex)=>this.taskCard(task,childIndex)).join('');
    const empty=`<div class="qf-task-empty"><div><span class="material-symbols-rounded">add_task</span><strong>Chưa có công việc</strong><small>Bấm Thêm công việc để tạo việc con đầu tiên cho dự án này.</small></div><button class="btn btn-primary btn-sm" data-action="quick-flow-add-task" data-project-tempid="${escapeAttr(project.__tempId)}" data-count="1"><span class="material-symbols-rounded">add</span>Thêm công việc</button></div>`;
    return `<section class="qf-task-project ${expanded?'':'is-collapsed'}"><header class="qf-task-project-head" data-action="quick-flow-toggle-project-tasks" data-project-tempid="${escapeAttr(project.__tempId)}"><div class="qf-task-project-order">Dự án ${projectIndex+1}</div><div class="qf-task-project-copy"><strong>${escapeHtml(project['Tên dự án']||`Dự án ${projectIndex+1} chưa đặt tên`)}</strong><small>${escapeHtml(owner)} · ${formatDate(project['Ngày bắt đầu'])||'--/--/----'} → ${formatDate(project['Ngày dự kiến kết thúc'])||'--/--/----'}</small></div><div class="qf-task-project-count"><span class="badge badge-blue">${tasks.length} công việc</span></div><div class="qf-task-project-actions"><button class="btn btn-sm" data-action="quick-flow-add-task" data-project-tempid="${escapeAttr(project.__tempId)}" data-count="1"><span class="material-symbols-rounded">add</span>Thêm công việc</button><button class="btn btn-sm" data-action="quick-flow-add-task" data-project-tempid="${escapeAttr(project.__tempId)}" data-count="5"><span class="material-symbols-rounded">playlist_add</span>Thêm 5</button><button class="row-action" data-action="quick-flow-toggle-project-tasks" data-project-tempid="${escapeAttr(project.__tempId)}" title="${expanded?'Thu gọn':'Mở rộng'}"><span class="material-symbols-rounded">${expanded?'expand_less':'expand_more'}</span></button></div></header>${expanded?`<div class="qf-task-project-body">${tasks.length?`<div class="qf-list qf-task-child-list">${taskHtml}</div>`:empty}</div>`:''}</section>`;
  },

  taskCard(r,i){
    const project=this.state().projects.find(p=>p.__tempId===r.__projectTempId);
    const owner=employeeName(r['Mã người phụ trách'])||'Chưa chọn người phụ trách';
    return `<article class="qf-card ${r.__expanded?'':'is-collapsed'}"><header class="qf-card-head"><span class="qf-index">${i+1}</span><div class="qf-card-title"><strong data-qf-summary-title="${escapeAttr(r.__tempId)}">${escapeHtml(r['Tên công việc']||'Công việc chưa đặt tên')}</strong><small>${escapeHtml(project?.['Tên dự án']||'Chưa chọn dự án')} · ${escapeHtml(owner)} · ${formatDate(r['Ngày bắt đầu'])||'--/--/----'} → ${formatDate(r['Hạn hoàn thành'])||'--/--/----'}</small></div><div class="qf-head-badges"><span class="badge badge-gray" data-qf-summary-count="${escapeAttr(r.__tempId)}">${(r.__participants||[]).length} người tham gia · ${(r.__files||[]).length} file</span>${statusBadge(r['Trạng thái']||'Chưa bắt đầu')}</div><div class="row-actions"><button class="row-action" data-action="quick-flow-toggle-row" data-kind="task" data-tempid="${escapeAttr(r.__tempId)}"><span class="material-symbols-rounded">${r.__expanded?'expand_less':'expand_more'}</span></button><button class="row-action" data-action="quick-flow-duplicate-row" data-kind="task" data-tempid="${escapeAttr(r.__tempId)}"><span class="material-symbols-rounded">content_copy</span></button><button class="row-action danger" data-action="quick-flow-delete-row" data-kind="task" data-tempid="${escapeAttr(r.__tempId)}"><span class="material-symbols-rounded">delete</span></button></div></header>${r.__expanded?`<div class="qf-card-body"><div class="qf-grid qf-task-grid">${this.field(r,'task','Tên công việc','text','Nhập công việc cụ thể cần giao.',true,'Tên công việc cần cụ thể, có đầu ra kiểm tra được.','qf-span-2')}${this.comboField(r,'task','Nhóm công việc',categoryOptions('Nhóm công việc'),'Chọn nhóm công việc',true,'Phân loại công việc theo Danh mục.')}${this.comboField(r,'task','Mã người phụ trách',personOptions(),'Tìm nhân sự...',true,'Người chịu trách nhiệm chính cho công việc.')}${this.field(r,'task','Ngày bắt đầu','date','',true,'Ngày bắt đầu thực hiện.')}${this.field(r,'task','Hạn hoàn thành','date','',true,'Dùng để cảnh báo sắp đến hạn và quá hạn.')}${this.comboField(r,'task','Mức độ ưu tiên',fixedOptions('priority'),'Chọn ưu tiên',true,'Sắp xếp mức độ ưu tiên xử lý.')}${this.comboField(r,'task','Trạng thái',fixedOptions('taskStatus'),'Chọn trạng thái',true,'Luồng xác nhận công việc hiện tại.')}${this.field(r,'task','Tiến độ (%)','number','0',false,'Nhập từ 0 đến 100.','','min="0" max="100"')}${this.field(r,'task','Trọng số công việc','number','1',false,'Hệ số khối lượng mặc định 1; tối đa 10.','','min="0.1" max="10" step="0.1"')}${this.textareaField(r,'task','Mô tả','Mô tả yêu cầu, phạm vi và lưu ý cần thực hiện...','Nội dung giao việc.','qf-span-2')}${this.textareaField(r,'task','Kết quả','Nhập kết quả hoặc để trống khi chưa hoàn thành...','Kết quả đầu ra khi hoàn thành.','qf-span-2')}${this.textareaField(r,'task','Ghi chú','Thông tin bổ sung...','Thông tin bổ sung.')}</div><div class="qf-lower-grid"><section class="qf-subpanel"><div class="qf-subpanel-title"><span>Người tham gia</span><span class="badge badge-gray">${(r.__participants||[]).length}</span></div>${this.personPicker('task',r)}</section><section class="qf-subpanel"><div class="qf-subpanel-title"><span>Tài liệu</span><span class="badge badge-gray">${(r.__files||[]).length}</span></div>${this.filePicker('task',r)}</section></div>${this.rowErrors(r)}</div>`:''}</article>`;
  },

  field(r,kind,field,type,placeholder,required,hint,extraClass='',attrs=''){
    const err=r.__fieldErrors?.[field];
    return `<div class="qf-field ${extraClass} ${err?'qf-invalid':''}"><label>${escapeHtml(field)}${required?'<span class="required">*</span>':''}${tooltipIcon(getFieldTooltip(kind==='project'?'projects':'tasks',field))}</label><input type="${type}" data-quick-field="${escapeAttr(field)}" data-qf-kind="${kind}" data-qf-tempid="${escapeAttr(r.__tempId)}" value="${escapeAttr(r[field]??'')}" placeholder="${escapeAttr(placeholder||'')}" ${attrs}><small>${escapeHtml(err||hint||'')}</small></div>`;
  },

  textareaField(r,kind,field,placeholder,hint,extraClass=''){
    const err=r.__fieldErrors?.[field];
    return `<div class="qf-field ${extraClass} ${err?'qf-invalid':''}"><label>${escapeHtml(field)}${tooltipIcon(getFieldTooltip(kind==='project'?'projects':'tasks',field))}</label><textarea data-quick-field="${escapeAttr(field)}" data-qf-kind="${kind}" data-qf-tempid="${escapeAttr(r.__tempId)}" placeholder="${escapeAttr(placeholder)}">${escapeHtml(r[field]||'')}</textarea><small>${escapeHtml(err||hint||'')}</small></div>`;
  },

  comboField(r,kind,field,options,placeholder,required,hint){
    const err=r.__fieldErrors?.[field];
    const normalized=(options||[]).map(o=>typeof o==='string'?{value:o,label:o}:o);
    const selected=normalized.find(o=>String(o.value)===String(r[field]||''));
    return `<div class="qf-field ${err?'qf-invalid':''}"><label>${escapeHtml(field)}${required?'<span class="required">*</span>':''}${tooltipIcon(getFieldTooltip(kind==='project'?'projects':'tasks',field))}</label><div class="combo" data-qf-combo="1"><div class="combo-control"><input class="combo-display" value="${escapeAttr(selected?.label||'')}" placeholder="${escapeAttr(placeholder)}" autocomplete="off"><button class="combo-arrow" type="button"><span class="material-symbols-rounded">expand_more</span></button></div><input type="hidden" data-quick-field="${escapeAttr(field)}" data-qf-kind="${kind}" data-qf-tempid="${escapeAttr(r.__tempId)}" value="${escapeAttr(r[field]||'')}"><div class="combo-source hidden">${normalized.map(o=>`<span data-value="${escapeAttr(o.value)}" data-label="${escapeAttr(o.label)}"></span>`).join('')}</div></div><small>${escapeHtml(err||hint||'')}</small></div>`;
  },

  projectTempCombo(r){
    const field='__projectTempId'; const err=r.__fieldErrors?.[field];
    const options=this.state().projects.map(p=>({value:p.__tempId,label:p['Tên dự án']||`Dự án ${p.__tempId.replace('QF_PROJECT_','')}`}));
    const selected=options.find(o=>o.value===r.__projectTempId);
    return `<div class="qf-field ${err?'qf-invalid':''}"><label>Dự án<span class="required">*</span>${tooltipIcon('Chọn một dự án vừa nhập ở bước 1. Hệ thống lưu mã tạm và tự đổi sang Mã dự án thật khi lưu.')}</label><div class="combo" data-qf-combo="1"><div class="combo-control"><input class="combo-display" value="${escapeAttr(selected?.label||'')}" placeholder="Chọn dự án vừa tạo..." autocomplete="off"><button class="combo-arrow" type="button"><span class="material-symbols-rounded">expand_more</span></button></div><input type="hidden" data-quick-field="__projectTempId" data-qf-kind="task" data-qf-tempid="${escapeAttr(r.__tempId)}" value="${escapeAttr(r.__projectTempId||'')}"><div class="combo-source hidden">${options.map(o=>`<span data-value="${escapeAttr(o.value)}" data-label="${escapeAttr(o.label)}"></span>`).join('')}</div></div><small>${escapeHtml(err||'Danh sách chỉ lấy từ các dự án của bước 1, không lấy từ database.')}</small></div>`;
  },

  personPicker(kind,r){
    const selected=new Set(kind==='project'?(r.__members||[]):(r.__participants||[]));
    const key=`qf-${kind}-${r.__tempId}`;
    const employees=APP.data.employees||[];
    const allSelected=employees.length>0&&employees.every(e=>selected.has(String(e['Mã nhân sự']||'')));
    const options=employees.map(e=>`<label class="multi-option" data-search="${escapeAttr(normalizeText(`${e['Mã nhân sự']} ${e['Họ và tên']} ${e['Nhóm']}`))}"><input class="check" type="checkbox" data-qf-person="${kind}" data-qf-tempid="${escapeAttr(r.__tempId)}" value="${escapeAttr(e['Mã nhân sự'])}" ${selected.has(e['Mã nhân sự'])?'checked':''}>${avatarHtml(e['Mã nhân sự'],27)}<span><strong>${escapeHtml(e['Họ và tên'])}</strong><small>${escapeHtml(e['Mã nhân sự'])} · ${escapeHtml(e['Nhóm']||'Chưa có Nhóm')}</small></span></label>`).join('');
    return `<div class="multi-select-list refined-multi-select qf-person-list"><div class="multi-select-search"><span class="material-symbols-rounded">search</span><input data-multi-search="${escapeAttr(key)}" placeholder="Tìm nhân sự theo mã, tên hoặc Nhóm..."></div><label class="multi-select-all-row"><input class="check" type="checkbox" data-qf-all="${kind}" data-qf-tempid="${escapeAttr(r.__tempId)}" ${allSelected?'checked':''}><span><strong>Chọn tất cả thành viên</strong><small>Chọn hoặc bỏ chọn toàn bộ ${employees.length} thành viên</small></span></label><div class="multi-options" data-multi-options="${escapeAttr(key)}">${options}</div></div><div class="field-help">Có thể chọn nhiều. Người phụ trách chính sẽ tự được loại khỏi danh sách liên kết trùng khi lưu.</div>`;
  },

  filePicker(kind,r){
    const files=r.__files||[];
    return `<div class="qf-upload-zone"><div><span class="material-symbols-rounded">cloud_upload</span><strong>Chọn file đính kèm</strong><small>PNG, JPG, PDF, DOCX, XLSX · tối đa 20MB/tệp. Có thể chọn nhiều lần và file sẽ cộng dồn.</small></div><button class="btn btn-sm" data-action="quick-flow-file-trigger" data-kind="${kind}" data-tempid="${escapeAttr(r.__tempId)}">Chọn tệp</button><input class="hidden" type="file" multiple accept="${this.ACCEPT}" data-quick-file="${kind}" data-qf-tempid="${escapeAttr(r.__tempId)}"></div><div class="qf-file-list">${files.length?files.map((f,i)=>`<div class="file-chip"><div class="file-chip-icon"><span class="material-symbols-rounded">${fileIcon(f.type||f.name)}</span></div><div><strong title="${escapeAttr(f.name)}">${escapeHtml(f.name)}</strong><small>${formatFileSize(f.size)}</small></div><div class="file-chip-actions"><button class="row-action danger" data-action="quick-flow-remove-file" data-kind="${kind}" data-tempid="${escapeAttr(r.__tempId)}" data-fileindex="${i}" title="Xóa file khỏi danh sách"><span class="material-symbols-rounded">close</span></button></div></div>`).join(''):'<span class="muted">Chưa chọn file.</span>'}</div>`;
  },

  rowErrors(r){
    return r.__errors?.length?`<div class="qf-row-errors"><strong>Cần kiểm tra:</strong>${r.__errors.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>`:'';
  },

  renderReview(){
    const q=this.state(); const pe=this.validateProjects(true),te=this.validateTasks(true); const totalErrors=pe.length+te.length;
    return `<section class="qf-review-head ${totalErrors?'has-errors':''}"><div><strong>Kiểm tra thông tin trước khi lưu</strong><p>${totalErrors?`Có ${totalErrors} lỗi cần xử lý. Bấm bước 1 hoặc 2 để quay lại chỉnh sửa.`:'Dữ liệu đã vượt qua kiểm tra frontend. Hệ thống sẽ lưu dự án trước, sau đó liên kết công việc và upload tài liệu.'}</p></div><span class="badge ${totalErrors?'badge-red':'badge-green'}">${totalErrors?totalErrors+' lỗi':'Sẵn sàng lưu'}</span></section>${totalErrors?`<div class="qf-review-errors">${[...pe,...te].map(x=>`<div><span class="material-symbols-rounded">error</span>${escapeHtml(x)}</div>`).join('')}</div>`:''}<div class="qf-review-section"><h3>A. Dự án</h3><div class="qf-review-list">${q.projects.map((r,i)=>this.reviewProject(r,i)).join('')}</div></div><div class="qf-review-section"><h3>B. Công việc</h3><div class="qf-review-list">${q.tasks.map((r,i)=>this.reviewTask(r,i)).join('')}</div></div>`;
  },

  reviewProject(r,i){
    return `<div class="qf-review-item"><span class="qf-index">${i+1}</span><div><strong>${escapeHtml(r['Tên dự án']||'Dự án chưa đặt tên')}</strong><small>${escapeHtml(r['Loại dự án']||'Chưa chọn loại')} · ${escapeHtml(employeeName(r['Mã người phụ trách'])||'Chưa chọn người phụ trách')}</small><p>${formatDate(r['Ngày bắt đầu'])||'--'} → ${formatDate(r['Ngày dự kiến kết thúc'])||'--'} · ${escapeHtml(r['Trạng thái']||'--')} · ${escapeHtml(r['Mức độ ưu tiên']||'--')}</p></div><div class="qf-review-counts"><span>${(r.__members||[]).length} thành viên</span><span>${(r.__files||[]).length} file</span></div></div>`;
  },

  reviewTask(r,i){
    const p=this.state().projects.find(x=>x.__tempId===r.__projectTempId);
    return `<div class="qf-review-item"><span class="qf-index">${i+1}</span><div><strong>${escapeHtml(r['Tên công việc']||'Công việc chưa đặt tên')}</strong><small>${escapeHtml(p?.['Tên dự án']||'Chưa chọn dự án')} · ${escapeHtml(employeeName(r['Mã người phụ trách'])||'Chưa chọn người phụ trách')}</small><p>Hạn ${formatDate(r['Hạn hoàn thành'])||'--'} · ${escapeHtml(r['Trạng thái']||'--')} · ${escapeHtml(r['Mức độ ưu tiên']||'--')}</p></div><div class="qf-review-counts"><span>${(r.__participants||[]).length} người tham gia</span><span>${(r.__files||[]).length} file</span></div></div>`;
  },

  cleanProject(r){
    return {'Tên dự án':r['Tên dự án'],'Loại dự án':r['Loại dự án'],'Mã người phụ trách':r['Mã người phụ trách'],'Ngày bắt đầu':r['Ngày bắt đầu'],'Ngày dự kiến kết thúc':r['Ngày dự kiến kết thúc'],'Trạng thái':r['Trạng thái'],'Mức độ ưu tiên':r['Mức độ ưu tiên'],'Tiến độ (%)':Number(r['Tiến độ (%)']||0),'Mô tả':r['Mô tả']||'','Ghi chú':r['Ghi chú']||''};
  },

  cleanTask(r,projectId){
    return {'Tên công việc':r['Tên công việc'],'Mã dự án':projectId,'Nhóm công việc':r['Nhóm công việc'],'Mã người phụ trách':r['Mã người phụ trách'],'Ngày bắt đầu':r['Ngày bắt đầu'],'Hạn hoàn thành':r['Hạn hoàn thành'],'Mức độ ưu tiên':r['Mức độ ưu tiên'],'Trạng thái':r['Trạng thái'],'Tiến độ (%)':Number(r['Tiến độ (%)']||0),'Mô tả':r['Mô tả']||'','Kết quả':r['Kết quả']||'','Ghi chú':r['Ghi chú']||''};
  },

  fileKey(file){return [file.name,file.size,file.lastModified||0].join('|');},

  async uploadRowFiles(row,moduleLabel,recordId,toast,stats,totalFiles){
    row.__uploadedFileKeys=row.__uploadedFileKeys||[];
    for(const file of (row.__files||[])){
      const key=this.fileKey(file); if(row.__uploadedFileKeys.includes(key))continue;
      stats.files++;
      updateToast(toast,'Đang upload tài liệu',`${stats.files}/${totalFiles}: ${file.name}`,'processing',0);
      await uploadOneFile(file,moduleLabel,recordId,(APP.data.categories?.['Loại tài liệu']||[])[0]||'Tài liệu khác','');
      row.__uploadedFileKeys.push(key);
    }
  },

  async saveAll(){
    const q=this.state(); if(!q||q.submitting)return;
    this.syncProjects(); this.syncTasks();
    const errors=[...this.validateProjects(true),...this.validateTasks(true)];
    if(errors.length){q.step=3;this.validationFailed(errors,'Kiểm tra thông tin');return;}
    q.submitting=true;
    const projectIdMap={};
    q.projects.forEach(p=>{if(p.__savedId)projectIdMap[p.__tempId]=p.__savedId;});
    const totalFiles=q.projects.reduce((n,r)=>n+(r.__files||[]).length,0)+q.tasks.reduce((n,r)=>n+(r.__files||[]).length,0);
    const stats={projects:q.projects.filter(r=>r.__savedId).length,tasks:q.tasks.filter(r=>r.__savedId).length,files:q.projects.reduce((n,r)=>n+(r.__uploadedFileKeys||[]).length,0)+q.tasks.reduce((n,r)=>n+(r.__uploadedFileKeys||[]).length,0)};
    document.getElementById('modal-root').innerHTML=''; closeComboMenu();
    const toast=showToast('Đang tạo dự án và công việc...','Bắt đầu xử lý dữ liệu. Web app vẫn có thể sử dụng bình thường.','processing',0);
    let context='Khởi tạo';
    try{
      for(let i=0;i<q.projects.length;i++){
        const row=q.projects[i];
        if(!row.__savedId){
          context=`Dự án #${i+1} — ${row['Tên dự án']}`;
          updateToast(toast,'Đang tạo dự án',`${i+1}/${q.projects.length}: ${row['Tên dự án']}`,'processing',0);
          const res=await gas('saveRecord','projects',this.cleanProject(row),APP.token,{timeout:60000}); mergeDataResult(res);
          row.__savedId=res.id||res?.record?.['Mã dự án']||'';
          if(!row.__savedId)throw new Error('Backend không trả về Mã dự án vừa tạo.');
          projectIdMap[row.__tempId]=row.__savedId; stats.projects++;
        }else projectIdMap[row.__tempId]=row.__savedId;
        if(!row.__membersSaved){
          context=`Thành viên dự án #${i+1} — ${row['Tên dự án']}`;
          const members=[...new Set(row.__members||[])].filter(id=>id&&id!==row['Mã người phụ trách']).map(employeeId=>({employeeId,role:'Thành viên',joinDate:row['Ngày bắt đầu'],status:row['Trạng thái']==='Hoàn thành'?'Đã kết thúc':'Đang tham gia'}));
          const mr=await gas('saveProjectMembers',row.__savedId,members,APP.token,{timeout:60000}); mergeDataResult(mr);
          row.__membersSaved=true;
        }
        context=`Tài liệu dự án #${i+1} — ${row['Tên dự án']}`;
        await this.uploadRowFiles(row,'Dự án',row.__savedId,toast,stats,totalFiles);
      }
      for(let i=0;i<q.tasks.length;i++){
        const row=q.tasks[i],projectId=projectIdMap[row.__projectTempId];
        if(!projectId)throw new Error(`Không tìm thấy Mã dự án thật cho công việc “${row['Tên công việc']}”.`);
        if(!row.__savedId){
          context=`Công việc #${i+1} — ${row['Tên công việc']}`;
          updateToast(toast,'Đang tạo công việc',`${i+1}/${q.tasks.length}: ${row['Tên công việc']}`,'processing',0);
          const res=await gas('saveRecord','tasks',this.cleanTask(row,projectId),APP.token,{timeout:60000}); mergeDataResult(res);
          row.__savedId=res.id||res?.record?.['Mã công việc']||'';
          if(!row.__savedId)throw new Error('Backend không trả về Mã công việc vừa tạo.');
          stats.tasks++;
        }
        if(!row.__participantsSaved){
          context=`Người tham gia công việc #${i+1} — ${row['Tên công việc']}`;
          const participants=[...new Set(row.__participants||[])].filter(id=>id&&id!==row['Mã người phụ trách']).map(employeeId=>({employeeId,role:'Phối hợp',joinDate:row['Ngày bắt đầu'],status:row['Trạng thái']==='Hoàn thành'?'Đã kết thúc':'Đang tham gia'}));
          if(APP.permissions.canManageTasks){const pr=await gas('saveTaskParticipants',row.__savedId,participants,APP.token,{timeout:60000});mergeDataResult(pr);}
          row.__participantsSaved=true;
        }
        context=`Tài liệu công việc #${i+1} — ${row['Tên công việc']}`;
        await this.uploadRowFiles(row,'Công việc',row.__savedId,toast,stats,totalFiles);
      }
      updateToast(toast,'Đã tạo thành công',`${q.projects.length} dự án · ${q.tasks.length} công việc · ${totalFiles} tài liệu`,'success',5200);
      APP.state.quickFlow=null;
      changePage(q.tasks.length?'tasks':'projects');
    }catch(err){
      q.submitting=false;
      q.__lastError=String(err?.message||err);
      updateToast(toast,'Không thể hoàn tất luồng thêm nhanh',`${context}. Đã tạo ${stats.projects}/${q.projects.length} dự án, ${stats.tasks}/${q.tasks.length} công việc. ${q.__lastError}`,'error',0);
      renderCurrentPage();
    }finally{
      if(APP.state.quickFlow)APP.state.quickFlow.submitting=false;
    }
  }
};
// PDF.js viewer: dựng trang PDF bằng canvas ngay trong web app, không dùng iframe data:application/pdf.
let KHAT_VONG_PDFJS_PROMISE = null;
function loadKhatVongPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (KHAT_VONG_PDFJS_PROMISE) return KHAT_VONG_PDFJS_PROMISE;
  KHAT_VONG_PDFJS_PROMISE = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-khat-vong-pdfjs="1"]');
    if (existing) {
      existing.addEventListener('load', () => window.pdfjsLib ? resolve(window.pdfjsLib) : reject(new Error('Không khởi tạo được PDF.js.')),{once:true});
      existing.addEventListener('error', () => reject(new Error('Không tải được thư viện PDF.js. Vui lòng kiểm tra kết nối mạng.')),{once:true});
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.dataset.khatVongPdfjs = '1';
    script.onload = () => {
      if (!window.pdfjsLib) return reject(new Error('Thư viện PDF.js đã tải nhưng không khởi tạo được.'));
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error('Không tải được PDF.js từ CDN. Hãy kiểm tra kết nối mạng hoặc chính sách chặn CDN.'));
    document.head.appendChild(script);
  }).catch(err => { KHAT_VONG_PDFJS_PROMISE = null; throw err; });
  return KHAT_VONG_PDFJS_PROMISE;
}

function pdfDataUrlToBytes(dataUrl) {
  const base64 = String(dataUrl || '').split(',').pop();
  if (!base64) throw new Error('Dữ liệu PDF trống.');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function renderKhatVongPdf(dataUrl, host) {
  if (!host) throw new Error('Không tìm thấy vùng hiển thị PDF.');
  host.innerHTML = `
    <div class="kv-pdf-toolbar">
      <div class="kv-pdf-page-controls">
        <button type="button" class="btn btn-sm" id="kv-pdf-prev" disabled>‹ Trang trước</button>
        <span id="kv-pdf-page-label">Đang tải PDF...</span>
        <button type="button" class="btn btn-sm" id="kv-pdf-next" disabled>Trang sau ›</button>
      </div>
      <div class="kv-pdf-zoom-controls">
        <button type="button" class="btn btn-sm" id="kv-pdf-zoom-out" disabled>−</button>
        <span id="kv-pdf-zoom-label">Vừa chiều rộng</span>
        <button type="button" class="btn btn-sm" id="kv-pdf-zoom-in" disabled>+</button>
        <button type="button" class="btn btn-sm" id="kv-pdf-fit" disabled>Vừa trang</button>
      </div>
    </div>
    <div class="kv-pdf-stage" id="kv-pdf-stage"><div class="preview-loading"><div class="spinner"></div><strong>Đang dựng trang PDF...</strong></div></div>`;
  const pdfjs = await loadKhatVongPdfJs();
  const bytes = pdfDataUrlToBytes(dataUrl);
  const pdf = await pdfjs.getDocument({data: bytes, useWorkerFetch: true, isEvalSupported: false}).promise;
  const stage = host.querySelector('#kv-pdf-stage');
  const pageLabel = host.querySelector('#kv-pdf-page-label');
  const zoomLabel = host.querySelector('#kv-pdf-zoom-label');
  const prev = host.querySelector('#kv-pdf-prev');
  const next = host.querySelector('#kv-pdf-next');
  const zoomOut = host.querySelector('#kv-pdf-zoom-out');
  const zoomIn = host.querySelector('#kv-pdf-zoom-in');
  const fit = host.querySelector('#kv-pdf-fit');
  const state = {page:1, zoom:1, fitWidth:true, task:null, destroyed:false};

  async function drawPage() {
    if (state.destroyed) return;
    if (state.task) { try { state.task.cancel(); } catch (_) {} state.task = null; }
    pageLabel.textContent = `Đang dựng trang ${state.page}/${pdf.numPages}...`;
    stage.innerHTML = '<div class="preview-loading"><div class="spinner"></div><strong>Đang hiển thị trang PDF...</strong></div>';
    const page = await pdf.getPage(state.page);
    const baseViewport = page.getViewport({scale:1});
    const availableWidth = Math.max(320, stage.clientWidth - 40);
    const fitScale = Math.min(1.8, availableWidth / baseViewport.width);
    const scale = Math.max(.45, Math.min(3.2, (state.fitWidth ? fitScale : fitScale) * state.zoom));
    const viewport = page.getViewport({scale});
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', {alpha:false});
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    canvas.className = 'kv-pdf-page-canvas';
    stage.innerHTML = '';
    stage.appendChild(canvas);
    state.task = page.render({canvasContext:context, viewport:viewport, transform:dpr !== 1 ? [dpr,0,0,dpr,0,0] : null, background:'rgb(255,255,255)'});
    await state.task.promise;
    state.task = null;
    pageLabel.textContent = `Trang ${state.page} / ${pdf.numPages}`;
    zoomLabel.textContent = `${Math.round(scale / Math.max(fitScale,.01) * 100)}%`;
    prev.disabled = state.page <= 1;
    next.disabled = state.page >= pdf.numPages;
    zoomOut.disabled = state.zoom <= .6;
    zoomIn.disabled = state.zoom >= 2.5;
    fit.disabled = false;
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  }

  prev.addEventListener('click', async () => { if(state.page>1){state.page--; await drawPage();} });
  next.addEventListener('click', async () => { if(state.page<pdf.numPages){state.page++; await drawPage();} });
  zoomOut.addEventListener('click', async () => {state.zoom=Math.max(.6,state.zoom-.2);state.fitWidth=false;await drawPage();});
  zoomIn.addEventListener('click', async () => {state.zoom=Math.min(2.5,state.zoom+.2);state.fitWidth=false;await drawPage();});
  fit.addEventListener('click', async () => {state.zoom=1;state.fitWidth=true;await drawPage();});
  await drawPage();
  return {destroy:() => {state.destroyed=true;if(state.task)try{state.task.cancel();}catch(_){}try{pdf.destroy();}catch(_){}}};
}

async function previewUploadedFile(fileId, docId) {
  const f = (APP.data.files || []).find(x => String(x['Mã tài liệu']) === String(docId) || String(x['File ID']) === String(fileId));
  openPreviewShell(f?.['Tên file'] || 'Xem tài liệu', f?.['MIME type'] || '', '<div class="preview-loading"><div class="spinner"></div><strong>Đang chuẩn bị tài liệu...</strong><small>Vui lòng chờ trong giây lát.</small></div>');
  try {
    const res = await gas('getFilePreviewDataUrl', fileId, APP.token, { timeout: 90000 });
    const safeName = escapeHtml(res.fileName || f?.['Tên file'] || 'Tài liệu');
    let viewer = '';
    if (res.mode === 'image' && res.dataUrl) {
      viewer = `<div class="preview-media-wrap"><img class="preview-image" src="${escapeAttr(res.dataUrl)}" alt="${escapeAttr(res.fileName || '')}"></div>`;
    } else if (res.mode === 'pdf' && res.dataUrl) {
      viewer = '<div class="kv-pdf-viewer" id="kv-pdf-viewer"></div>';
    } else if (res.mode === 'drive') {
      // Dùng URL preview chính thức cho tệp lớn/Office/Workspace; PDF nhỏ đã được dựng bằng PDF.js ở trên.
      viewer = `<iframe class="preview-frame" src="${escapeAttr(res.previewUrl)}" title="${escapeAttr(res.fileName || 'Xem tài liệu')}" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    } else if (res.mode === 'text') {
      viewer = `<pre class="preview-text">${escapeHtml(res.text || '')}</pre>`;
    } else {
      viewer = `<div class="preview-fallback"><span class="material-symbols-rounded">${fileIcon(res.mimeType)}</span><h3>${safeName}</h3><p>${escapeHtml(res.reason || 'Định dạng này chưa thể hiển thị trực tiếp.')}</p></div>`;
    }
    const links = `<div class="preview-toolbar"><span>${escapeHtml(res.mode === 'pdf' ? 'Đang hiển thị PDF trực tiếp trong website' : (res.reason || 'Đang xem tài liệu trực tiếp'))}</span><div class="preview-toolbar-actions"><button class="btn btn-sm btn-primary" data-action="download-file-link" data-url="${escapeAttr(res.viewUrl)}">Mở trên Drive</button><button class="btn btn-sm" data-action="download-file-link" data-url="${escapeAttr(res.downloadUrl)}">Tải xuống</button></div></div>`;
    const body = document.querySelector('#preview-root .preview-body');
    if (body) body.innerHTML = links + `<div class="preview-viewer">${viewer}</div>`;
    if (res.mode === 'pdf' && res.dataUrl) {
      try {
        const host = document.getElementById('kv-pdf-viewer');
        APP.state.previewCleanup = await renderKhatVongPdf(res.dataUrl, host);
      } catch (pdfErr) {
        const host = document.getElementById('kv-pdf-viewer');
        if (host) host.innerHTML = `<div class="preview-fallback"><span class="material-symbols-rounded">error</span><h3>Không thể dựng PDF trực tiếp</h3><p>${escapeHtml(pdfErr.message || 'Không tải được bộ đọc PDF.')}</p><p>Hãy kiểm tra kết nối tới thư viện PDF.js (cdnjs) rồi mở lại tài liệu.</p><div class="preview-toolbar-actions"><button class="btn btn-primary" data-action="download-file-link" data-url="${escapeAttr(res.viewUrl)}">Mở bản gốc trên Drive</button><button class="btn" data-action="download-file-link" data-url="${escapeAttr(res.downloadUrl)}">Tải xuống</button></div></div>`;
      }
    }
  } catch (err) {
    const body = document.querySelector('#preview-root .preview-body');
    if (body) body.innerHTML = `<div class="preview-fallback"><span class="material-symbols-rounded">error</span><h3>Không thể xem tài liệu</h3><p>${escapeHtml(err.message || 'Đã xảy ra lỗi khi tải tài liệu.')}</p><div class="preview-toolbar-actions"><button class="btn btn-primary" data-action="download-file-link" data-url="${escapeAttr(f?.['Link xem'] || '')}">Thử mở trên Drive</button></div></div>`;
  }
}

function openPreviewShell(title, mime, content, onClose) {
  APP.state.previewCleanup = onClose || null;
  const root = document.getElementById('preview-root');
  if (!root) return;
  root.innerHTML = `<style>
    .preview-overlay{position:fixed;inset:0;z-index:10050;background:rgba(15,23,42,.72);display:flex;align-items:center;justify-content:center;padding:2vh 2vw}
    .preview-modal{width:min(1500px,96vw);height:96vh;max-height:96vh;background:#fff;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,.3)}
    .preview-head{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #e5e7eb;background:#fff}
    .preview-title{min-width:0;display:flex;flex-direction:column;gap:3px}.preview-title strong{overflow-wrap:anywhere}.preview-title small{color:#64748b}
    .preview-body{min-height:0;flex:1;display:flex;flex-direction:column;overflow:hidden;background:#f1f5f9}
    .preview-toolbar{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;background:#fff;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b}
    .preview-toolbar-actions{display:flex;gap:8px;flex-wrap:wrap}.preview-viewer{flex:1;min-height:0;overflow:auto;display:flex;align-items:stretch;justify-content:stretch}
    .preview-frame{width:100%;height:100%;min-height:70vh;border:0;background:#fff}.preview-media-wrap{width:100%;height:100%;overflow:auto;display:flex;align-items:center;justify-content:center;padding:16px}.preview-image{max-width:100%;max-height:100%;object-fit:contain}
    .preview-text{margin:0;padding:18px;width:100%;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;background:#fff;font:13px/1.6 ui-monospace,monospace}
    .kv-pdf-viewer{width:100%;height:100%;min-height:0;display:flex;flex-direction:column;background:#e2e8f0}.kv-pdf-toolbar{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;background:#fff;border-bottom:1px solid #cbd5e1;flex-wrap:wrap}.kv-pdf-page-controls,.kv-pdf-zoom-controls{display:flex;align-items:center;gap:8px}.kv-pdf-toolbar span{font-size:12px;color:#334155;font-weight:600;min-width:90px;text-align:center}.kv-pdf-stage{flex:1;min-height:0;overflow:auto;display:flex;align-items:flex-start;justify-content:center;padding:18px}.kv-pdf-page-canvas{display:block;max-width:none;background:#fff;box-shadow:0 2px 14px rgba(15,23,42,.18)}
    .preview-loading,.preview-fallback{margin:auto;text-align:center;padding:28px;max-width:560px;color:#475569}.preview-fallback .material-symbols-rounded{font-size:42px;color:#64748b}.preview-fallback h3{color:#0f172a}
    @media(max-width:700px){.preview-overlay{padding:0}.preview-modal{width:100vw;height:100dvh;max-height:100dvh;border-radius:0}.preview-toolbar{align-items:flex-start;flex-direction:column}.preview-frame{min-height:75vh}}
  </style><div class="preview-overlay"><div class="preview-modal"><div class="preview-head"><div class="preview-title"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(mime || '')}</small></div><div class="preview-actions"><button class="row-action" data-action="close-preview" aria-label="Đóng xem trước"><span class="material-symbols-rounded">close</span></button></div></div><div class="preview-body">${content}</div></div></div>`;
}

function closePreview() {
  if (APP.state.previewCleanup) try { APP.state.previewCleanup(); } catch (e) {}
  APP.state.previewCleanup = null;
  const root = document.getElementById('preview-root');
  if (root) root.innerHTML = '';
}

function openExternal(url) {
  const target = String(url || '').trim();
  if (!/^https:\/\//i.test(target)) return;
  window.open(target, '_blank', 'noopener,noreferrer');
}

/* ========================= IMPORT / EXPORT XLSX ========================= */
function openImportModal(module){const cfg=IMPORT_CONFIG[module];if(!cfg){showToast('Không hỗ trợ Import','Module này không có chức năng Import.','warning');return;}APP.state.import={module,rows:[],validRows:[],errors:[]};const body=`<div class="form-section"><div class="section-title-row"><div><strong>${escapeHtml(cfg.label)}</strong><div class="field-help">Tải mẫu trước để nhập đúng tên cột và danh sách lựa chọn.</div></div><button class="btn" data-action="download-template" data-module="${module}"><span class="material-symbols-rounded">download</span>Tải mẫu XLSX</button></div><div class="upload-zone"><div class="upload-zone-icon"><span class="material-symbols-rounded">table_view</span></div><div class="upload-zone-copy"><strong>Chọn file XLSX/XLS</strong><small>Hệ thống sẽ đọc và kiểm tra trước, chưa lưu ngay.</small></div><button class="btn btn-sm" data-action="import-file-trigger">Chọn file</button><input id="import-file-input" class="hidden" type="file" accept=".xlsx,.xls"></div></div><div id="import-preview">${emptyState('table_view','Chưa chọn file','Sau khi chọn file, dữ liệu hợp lệ và lỗi sẽ hiển thị tại đây.')}</div>`;openModal(modalShell('Import '+cfg.label,'Giữ nguyên tên cột của file mẫu. Chỉ dòng hợp lệ được phép lưu.',body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="import-save" id="import-save-btn" disabled><span class="material-symbols-rounded">save</span>Lưu dữ liệu hợp lệ</button>`,'xwide'));}
async function handleImportXlsxFile(file){if(!file)return;if(!window.XLSX){showToast('Thiếu thư viện đọc Excel','Không thể đọc XLSX lúc này. Vui lòng kiểm tra kết nối mạng rồi thử lại.','error');return;}const t=showToast('Đang đọc file','Dữ liệu đang được kiểm tra trên trình duyệt, chưa lưu vào database.','processing',0);try{const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:'array',cellDates:false});const ws=wb.Sheets[wb.SheetNames[0]];const rows=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false});const result=validateImportedRows(APP.state.import.module,rows);APP.state.import.rows=rows;APP.state.import.validRows=result.validRows;APP.state.import.errors=result.errors;renderImportPreview(result);updateToast(t,'Đã kiểm tra dữ liệu',`${result.validRows.length} dòng hợp lệ, ${result.errors.length} dòng lỗi.` ,result.errors.length?'warning':'success',4000);}catch(err){updateToast(t,'Không thể đọc file',err.message,'error',5500);}}
function validateImportedRows(module,rows){const cfg=IMPORT_CONFIG[module];const validRows=[],errors=[];const seen=new Set();rows.forEach((row,idx)=>{const out={},errs=[];cfg.fields.forEach(f=>out[f]=row[f]??'');if(cfg.fields.every(f=>String(out[f]??'').trim()===''))return;(cfg.required||[]).forEach(f=>{if(String(out[f]??'').trim()==='')errs.push('Thiếu '+f);});(cfg.dateFields||[]).forEach(f=>{if(out[f]&&!parseImportDate(out[f]))errs.push('Sai định dạng '+f);else if(out[f])out[f]=toDateInput(parseImportDate(out[f]));});(cfg.numberFields||[]).forEach(f=>{if(out[f]!==''&&!isFinite(Number(String(out[f]).replace(/,/g,''))))errs.push('Sai định dạng số '+f);else if(out[f]!=='')out[f]=Number(String(out[f]).replace(/,/g,''));});Object.entries(cfg.optionMap||{}).forEach(([field,source])=>{if(!out[field])return;const resolved=resolveImportOptionValue(source,out[field]);if(resolved===null)errs.push(`${field} không nằm trong danh sách lựa chọn`);else out[field]=resolved;});const key=cfg.required.map(f=>normalizeText(out[f])).join('|');if(seen.has(key))errs.push('Dòng bị trùng trong file');seen.add(key);if(errs.length)errors.push({row:idx+2,record:out,errors:errs});else validRows.push(out);});return {total:validRows.length+errors.length,validRows,errors};}
function renderImportPreview(result){const el=document.getElementById('import-preview');if(!el)return;const rows=[...result.validRows.slice(0,15).map((r,i)=>({row:i+2,record:r,errors:[]})),...result.errors.slice(0,15)];const fields=IMPORT_CONFIG[APP.state.import.module].fields;el.innerHTML=`<div class="report-summary" style="margin:10px 0"><div class="stat"><small>Tổng dòng</small><strong>${result.total}</strong></div><div class="stat"><small>Hợp lệ</small><strong class="text-success">${result.validRows.length}</strong></div><div class="stat"><small>Dòng lỗi</small><strong class="text-danger">${result.errors.length}</strong></div><div class="stat"><small>Sẵn sàng lưu</small><strong>${result.validRows.length}</strong></div></div><div class="wizard-grid-wrap"><table class="wizard-table" style="min-width:1100px"><thead><tr><th>Dòng</th>${fields.slice(0,6).map(f=>`<th>${escapeHtml(f)}</th>`).join('')}<th>Trạng thái</th><th>Mô tả lỗi</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${x.row}</td>${fields.slice(0,6).map(f=>`<td>${escapeHtml(x.record[f]??'')}</td>`).join('')}<td>${x.errors.length?statusBadge('Lỗi'):statusBadge('Hợp lệ')}</td><td class="${x.errors.length?'text-danger':'muted'}">${escapeHtml(x.errors.join('; ')||'Dữ liệu hợp lệ')}</td></tr>`).join('')}</tbody></table></div><div class="field-help">Bảng xem trước chỉ hiển thị tối đa 30 dòng để giao diện ổn định. Toàn bộ dòng hợp lệ vẫn được lưu khi xác nhận.</div>`;const btn=document.getElementById('import-save-btn');if(btn)btn.disabled=!result.validRows.length;}
async function saveImportRows(){const im=APP.state.import;if(!im?.validRows?.length)return;const t=showToast('Đang import dữ liệu',`${im.validRows.length} dòng hợp lệ đang được lưu.`,'processing',0);try{const res=await gas('importRecordsFromXlsx',im.module,im.validRows,APP.token,{timeout:120000});if(res.success===false)throw new Error(res.errors?.map(x=>`Dòng ${x.row}: ${x.errors.join(', ')}`).join('; ')||'Import thất bại.');mergeDataResult(res);closeModal();updateToast(t,'Import thành công',`${im.validRows.length} dòng đã được thêm vào hệ thống.`,'success',4500);renderCurrentPage();}catch(err){updateToast(t,'Import thất bại',err.message,'error',6500);}}
function getImportOptions(source){if(Array.isArray(source))return source.map(v=>({value:v,label:v}));if(source==='employees')return personOptions();if(source==='projects')return projectOptions();if(source?.startsWith('category:'))return categoryOptions(source.split(':')[1]);if(source?.startsWith('fixed:'))return fixedOptions(source.split(':')[1]);return [];}
function getImportTemplateOptions(source){
  if(source==='employees'){
    const rows=APP.data.employees||[], counts={};
    rows.forEach(e=>{const name=String(e['Họ và tên']||e['Mã nhân sự']||'').trim();counts[name]=(counts[name]||0)+1;});
    return rows.map(e=>{const name=String(e['Họ và tên']||e['Mã nhân sự']||'').trim();const id=String(e['Mã nhân sự']||'').trim();return {value:id,label:counts[name]>1?`${name} · ${id}`:name};});
  }
  if(source==='projects'){
    const rows=APP.data.projects||[], counts={};
    rows.forEach(p=>{const name=String(p['Tên dự án']||p['Mã dự án']||'').trim();counts[name]=(counts[name]||0)+1;});
    return rows.map(p=>{const name=String(p['Tên dự án']||p['Mã dự án']||'').trim();const id=String(p['Mã dự án']||'').trim();return {value:id,label:counts[name]>1?`${name} · ${id}`:name};});
  }
  return getImportOptions(source).map(o=>({value:o.value,label:o.label}));
}
function resolveImportOptionValue(source,input){
  const text=String(input??'').trim();
  if(!text)return '';
  const raw=getImportOptions(source);
  const direct=raw.find(o=>String(o.value)===text);
  if(direct)return direct.value;
  const rawLabel=raw.find(o=>normalizeText(o.label)===normalizeText(text));
  if(rawLabel)return rawLabel.value;
  const friendly=getImportTemplateOptions(source);
  const friendlyLabel=friendly.find(o=>normalizeText(o.label)===normalizeText(text));
  if(friendlyLabel)return friendlyLabel.value;
  return null;
}
async function downloadXlsxTemplate(module){const cfg=IMPORT_CONFIG[module];if(!cfg)return;if(!window.ExcelJS){showToast('Không thể tạo mẫu XLSX','Thư viện Excel chưa tải được. Vui lòng kiểm tra kết nối mạng.','error');return;}const t=showToast('Đang tạo mẫu XLSX','Đang tạo header và danh sách dropdown theo dữ liệu hiện tại.','processing',0);try{const wb=new ExcelJS.Workbook();const ws=wb.addWorksheet(cfg.label);const opt=wb.addWorksheet('_DanhMuc',{state:'veryHidden'});ws.columns=cfg.fields.map(f=>({header:f,key:f,width:Math.max(16,Math.min(32,f.length+5))}));ws.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};ws.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF5547E6'}};ws.views=[{state:'frozen',ySplit:1}];for(let r=2;r<=102;r++){cfg.fields.forEach((f,ci)=>{const cell=ws.getCell(r,ci+1);if((cfg.dateFields||[]).includes(f))cell.numFmt='dd/mm/yyyy';});}
  let optionCol=1;for(const [field,source] of Object.entries(cfg.optionMap||{})){const options=getImportTemplateOptions(source);if(!options.length)continue;const colLetter=excelCol(optionCol);opt.getCell(1,optionCol).value=field;options.forEach((o,i)=>opt.getCell(i+2,optionCol).value=o.label);const fieldCol=cfg.fields.indexOf(field)+1;if(fieldCol>0){for(let r=2;r<=102;r++){ws.getCell(r,fieldCol).dataValidation={type:'list',allowBlank:true,formulae:[`'_DanhMuc'!$${colLetter}$2:$${colLetter}$${options.length+1}`]};}}optionCol++;}
  const buf=await wb.xlsx.writeBuffer();downloadBlob(`${safeFileName(cfg.label)}_Mau_Import.xlsx`,new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));updateToast(t,'Đã tạo mẫu XLSX','Mẫu không có dữ liệu mẫu và dropdown lấy từ hệ thống hiện tại.','success',3500);}catch(err){updateToast(t,'Không thể tạo mẫu',err.message,'error',5500);}}
async function exportCurrentXlsx(module){if(!window.ExcelJS){showToast('Không thể Export XLSX','Thư viện Excel chưa tải được.','error');return;}const cfg=exportConfig(module);if(!cfg)return;const rows=cfg.rows();const selected=APP.state.selected[module];const outRows=selected?.size?rows.filter(r=>selected.has(r[cfg.idField])):rows;const t=showToast('Đang xuất XLSX',`${outRows.length} bản ghi đang được đóng gói.`,'processing',0);try{const wb=new ExcelJS.Workbook();const ws=wb.addWorksheet(cfg.label);ws.columns=cfg.fields.map(f=>({header:f,key:f,width:Math.max(14,Math.min(34,f.length+6))}));ws.getRow(1).height=24;ws.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};ws.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF5547E6'}};ws.views=[{state:'frozen',ySplit:1}];outRows.forEach(r=>{const row={};cfg.fields.forEach(f=>row[f]=formatExportValue(r[f],f));ws.addRow(row);});ws.eachRow((row,ri)=>{if(ri>1)row.height=20;});const buf=await wb.xlsx.writeBuffer();downloadBlob(`${safeFileName(cfg.label)}_${new Date().toISOString().slice(0,10)}.xlsx`,new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));updateToast(t,'Export thành công',`${outRows.length} bản ghi đã được xuất.`,'success',3000);}catch(err){updateToast(t,'Export thất bại',err.message,'error',5000);}}
function exportConfig(module){const map={employees:{label:'Nhân sự',rows:()=>APP.data.employees||[],idField:'Mã nhân sự'},projects:{label:'Dự án',rows:()=>APP.data.projects||[],idField:'Mã dự án'},tasks:{label:'Công việc',rows:()=>periodFilter(APP.data.tasks||[],'Hạn hoàn thành'),idField:'Mã công việc'},kpiMonths:{label:'KPI tháng',rows:()=>periodFilter(APP.data.kpiMonths||[],'Kỳ'),idField:'Mã KPI tháng'},kpiTemplates:{label:'Mẫu KPI',rows:()=>APP.data.kpiTemplates||[],idField:'Mã mẫu KPI'},files:{label:'Tài liệu',rows:()=>APP.data.files||[],idField:'Mã tài liệu'},users:{label:'Người dùng',rows:()=>APP.data.users||[],idField:'Mã người dùng'}};const x=map[module];if(!x)return null;const rows=x.rows();x.fields=rows.length?Object.keys(rows[0]).filter(f=>f!=='Mật khẩu'):IMPORT_CONFIG[module]?.fields||[];return x;}
function formatExportValue(v,f){if(v===null||v===undefined)return'';if(/Ngày|Thời gian/.test(f))return formatDate(v)||v;if(f==='Kỳ')return formatPeriod(v);if(f==='Số điện thoại')return formatPhoneRaw(v);return v;}
function downloadBlob(filename,blob){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function excelCol(n){let s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;}

function openPriorityDrilldown(priority){
  const rows=periodFilter(APP.data.tasks||[],'Hạn hoàn thành').filter(t=>String(t['Mức độ ưu tiên']||'')===String(priority||''));
  const overdue=rows.filter(isTaskOverdue).length,waiting=rows.filter(t=>t['Trạng thái']==='Chờ xác nhận').length,done=rows.filter(t=>t['Trạng thái']==='Hoàn thành').length;
  const summary=`<div class="priority-drilldown-summary"><span><small>Tổng công việc</small><strong>${rows.length}</strong></span><span class="danger"><small>Quá hạn</small><strong>${overdue}</strong></span><span class="warning"><small>Chờ xác nhận</small><strong>${waiting}</strong></span><span class="success"><small>Hoàn thành</small><strong>${done}</strong></span></div>`;
  const table=rows.length?renderTasksTable(rows,'priorityDrilldown',false):emptyState('task_alt','Không có công việc','Không có công việc phù hợp trong kỳ đang xem.');
  openModal(modalShell(`Công việc ưu tiên: ${priority}`,`${rows.length} công việc trong ${APP.state.period?.label||'kỳ đang xem'}. Nhấp biểu tượng xem để mở hồ sơ công việc.`,`${summary}<div class="panel table-panel priority-drilldown-table">${table}</div>`,`<button class="btn btn-primary" data-action="close-modal">Đóng</button>`,'xwide'));
}


/* ========================= TOOLBAR / FILTER / PAGINATION ========================= */
function moduleToolbar(module,filterSpecs,actions='',viewToggle=false){APP.state.filterSpecs=APP.state.filterSpecs||{};APP.state.filterSpecs[module]=filterSpecs||[];const filters=APP.state.filters[module]||{};const chips=Object.entries(filters).flatMap(([field,set])=>[...set].map(v=>`<span class="filter-chip">${escapeHtml(field)}: ${escapeHtml(labelForFilter(field,v))}<button data-action="remove-filter" data-module="${module}" data-field="${escapeAttr(field)}" data-value="${encodeURIComponent(v)}"><span class="material-symbols-rounded">close</span></button></span>`)).join('');const views=viewToggle?`<div class="view-controls">${module==='projects'?viewButtons('projects',['cards','table']):module==='employees'?viewButtons('employees',['cards','table']):module==='kpiMonths'?viewButtons('kpi',['cards','table']):''}</div>`:'';return `<div class="panel module-toolbar"><div class="toolbar-left"><div class="search-box"><span class="material-symbols-rounded">search</span><input data-search-module="${module}" value="${escapeAttr(APP.state.search[module]||'')}" placeholder="Tìm trong dữ liệu hiện tại..."></div>${filterSpecs?.length?`<button class="filter-btn" data-action="apply-filter" data-module="${module}"><span class="material-symbols-rounded">filter_alt</span>Bộ lọc</button>`:''}${chips}</div><div class="toolbar-right">${views}<select data-sort="${module}" style="height:38px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--text);padding:0 8px"><option value="newest" ${(APP.state.sort[module]||'newest')==='newest'?'selected':''}>Mới nhất</option><option value="oldest" ${APP.state.sort[module]==='oldest'?'selected':''}>Cũ nhất</option></select><select data-page-size="${module}" style="height:38px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--text);padding:0 8px">${[10,50,100].map(n=>`<option value="${n}" ${(APP.state.pageSize[module]||10)===n?'selected':''}>${n} dòng</option>`).join('')}</select></div></div>`;}
function viewButtons(module,views){return views.map(v=>`<button class="${APP.state.view[module]===v?'active':''}" data-action="view-switch" data-module="${module}" data-view="${v}" title="${v==='cards'?'Dạng card':'Dạng dòng'}"><span class="material-symbols-rounded">${v==='cards'?'grid_view':'view_list'}</span></button>`).join('');}
function setView(module,view){APP.state.view[module]=view;renderCurrentPage();}
function setSubTab(group,value){APP.state[group]=value;if(group==='categoryTab')APP.state.pageNo.categories=1;renderCurrentPage();}
function tableFooter(module,total){const size=APP.state.pageSize[module]||10,page=APP.state.pageNo[module]||1,pages=Math.max(1,Math.ceil(total/size));const start=total?((page-1)*size+1):0,end=Math.min(total,page*size);const nums=pageNumbers(page,pages);return `<div class="table-footer"><span>Hiển thị ${start}-${end} của ${total} bản ghi</span><div class="pagination"><button data-action="page-go" data-module="${module}" data-page="${Math.max(1,page-1)}" ${page<=1?'disabled':''}><span class="material-symbols-rounded" style="font-size:16px">chevron_left</span></button>${nums.map(n=>`<button class="${n===page?'active':''}" data-action="page-go" data-module="${module}" data-page="${n}">${n}</button>`).join('')}<button data-action="page-go" data-module="${module}" data-page="${Math.min(pages,page+1)}" ${page>=pages?'disabled':''}><span class="material-symbols-rounded" style="font-size:16px">chevron_right</span></button></div></div>`;}
function pageNumbers(page,pages){let a=[];for(let i=Math.max(1,page-2);i<=Math.min(pages,page+2);i++)a.push(i);while(a.length<5&&a[0]>1)a.unshift(a[0]-1);while(a.length<5&&a[a.length-1]<pages)a.push(a[a.length-1]+1);return unique(a);}
function setPageNo(module,page){APP.state.pageNo[module]=Math.max(1,page);renderCurrentPage();}
function paginate(module,rows){return paginatedRows(module,rows);}function paginatedRows(module,rows){const size=APP.state.pageSize[module]||10;let p=APP.state.pageNo[module]||1;const pages=Math.max(1,Math.ceil(rows.length/size));if(p>pages){p=pages;APP.state.pageNo[module]=pages;}const start=(p-1)*size;return rows.slice(start,start+size);}
function applySearchFilter(module,rows,fields){const q=normalizeText(APP.state.search[module]||'');if(!q)return [...rows];return rows.filter(r=>fields.some(f=>normalizeText(displaySearchValue(f,r[f])).includes(q)));}
function displaySearchValue(field,v){if(field.startsWith('Mã người')||field==='Mã nhân sự')return `${v} ${employeeName(v)}`;if(field==='Mã dự án')return `${v} ${projectName(v)}`;return v;}
function applyGenericFilters(module,rows){const f=APP.state.filters[module]||{};return rows.filter(r=>Object.entries(f).every(([field,set])=>!set.size||set.has(String(r[field]??''))));}
function sortRows(module,rows,defaultField){const direction=APP.state.sort[module]||'newest';return [...rows].sort((a,b)=>{let av=a[defaultField],bv=b[defaultField];const ad=parseDate(av),bd=parseDate(bv);let cmp;if(ad&&bd)cmp=ad-bd;else cmp=String(av??'').localeCompare(String(bv??''),'vi');return direction==='oldest'?cmp:-cmp;});}
function openFilterPopover(module,anchor){document.getElementById('filter-popover')?.remove();const specs=APP.state.filterSpecs?.[module]||[];if(!specs.length)return;const filters=APP.state.filters[module]||{};const div=document.createElement('div');div.id='filter-popover';div.className='floating-menu';div.style.minWidth='270px';div.style.maxHeight='420px';div.style.overflow='auto';div.innerHTML=specs.map(([field,options])=>`<div style="padding:7px;border-bottom:1px solid var(--line)"><strong style="font-size:11.5px">${escapeHtml(field)}</strong><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">${(options||[]).filter(Boolean).map(v=>`<button style="width:auto;min-height:29px;border:1px solid ${filters[field]?.has(String(v))?'#6959ed':'var(--line)'};background:${filters[field]?.has(String(v))?'#f0efff':'var(--surface)'}" data-action="filter-option" data-module="${module}" data-field="${escapeAttr(field)}" data-value="${encodeURIComponent(v)}">${escapeHtml(labelForFilter(field,v))}</button>`).join('')}</div></div>`).join('')+`<button data-action="clear-filters" data-module="${module}"><span class="material-symbols-rounded">filter_alt_off</span>Xóa bộ lọc</button>`;document.body.appendChild(div);positionFloating(div,anchor);}
function toggleFilterOption(module,field,value){APP.state.filters[module]=APP.state.filters[module]||{};APP.state.filters[module][field]=APP.state.filters[module][field]||new Set();const set=APP.state.filters[module][field];set.has(value)?set.delete(value):set.add(value);APP.state.pageNo[module]=1;document.getElementById('filter-popover')?.remove();renderCurrentPage();}
function removeFilter(module,field,value){APP.state.filters[module]?.[field]?.delete(value);APP.state.pageNo[module]=1;renderCurrentPage();}
function clearModuleFilters(module){APP.state.filters[module]={};APP.state.pageNo[module]=1;document.getElementById('filter-popover')?.remove();renderCurrentPage();}
function labelForFilter(field,v){if(field==='Mã dự án')return projectName(v)||v;if(field.includes('Mã người')||field==='Mã nhân sự')return employeeName(v)||v;return v;}

/* selection / bulk */
function isSelected(module,id){return APP.state.selected[module]?.has(id)||false;}function toggleRowSelection(module,id,checked){APP.state.selected[module]=APP.state.selected[module]||new Set();checked?APP.state.selected[module].add(id):APP.state.selected[module].delete(id);renderCurrentPage();}function toggleSelectAll(module,checked){APP.state.selected[module]=APP.state.selected[module]||new Set();const rows=module==='projects'?APP.data.projects:APP.data.tasks;const visible=paginatedRows(module,applyGenericFilters(module,applySearchFilter(module,rows||[],Object.keys(rows?.[0]||{}))));visible.forEach(r=>{const id=r[module==='projects'?'Mã dự án':'Mã công việc'];checked?APP.state.selected[module].add(id):APP.state.selected[module].delete(id);});renderCurrentPage();}
function bulkBar(module,count,actions){return `<div class="bulk-bar"><strong>Đã chọn ${count} bản ghi</strong>${actions.map(([a,l,ic])=>`<button class="btn btn-sm" data-action="bulk-action" data-module="${module}" data-bulk="${a}"><span class="material-symbols-rounded">${ic}</span>${l}</button>`).join('')}</div>`;}
async function bulkAction(module,action){const ids=[...(APP.state.selected[module]||[])];if(!ids.length)return;if(action==='export')return exportCurrentXlsx(module);if(action==='delete'){showConfirm('Xóa các bản ghi đã chọn',`Bạn sắp xóa ${ids.length} bản ghi. Thao tác này không thể hoàn tác từ web app.`,async()=>{const t=showToast('Đang xóa dữ liệu',`0/${ids.length} bản ghi.`,'processing',0);try{for(let i=0;i<ids.length;i++){updateToast(t,'Đang xóa dữ liệu',`${i+1}/${ids.length}: ${ids[i]}`,'processing',0);const res=await gas('deleteRecord',module,ids[i],APP.token,{timeout:60000});mergeDataResult(res);}APP.state.selected[module]=new Set();updateToast(t,'Đã xóa dữ liệu',`${ids.length} bản ghi đã được xóa.`,'success',3500);renderCurrentPage();}catch(err){updateToast(t,'Không thể xóa',err.message,'error',5500);}},'Xóa');return;}if(action==='status'&&module==='tasks')return openBulkTaskStatusModal(ids);}
function openBulkTaskStatusModal(ids){openModal(modalShell('Đổi trạng thái hàng loạt',`${ids.length} công việc đã chọn.`,`${formField('tasks','Trạng thái',comboHtml('Trạng thái','Đang thực hiện',fixedOptions('taskStatus'),'Chọn trạng thái'),'Chỉ chọn Hoàn thành khi bạn có quyền quản lý.',true,true)}<input type="hidden" id="bulk-task-ids" value="${escapeAttr(ids.join(','))}">`,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" onclick="saveBulkTaskStatus()">Cập nhật</button>`,'small'));}
window.saveBulkTaskStatus=async function(){const ids=(document.getElementById('bulk-task-ids')?.value||'').split(',').filter(Boolean),status=collectForm()['Trạng thái'];const t=showToast('Đang cập nhật trạng thái',`0/${ids.length} công việc.`,'processing',0);try{for(let i=0;i<ids.length;i++){const task=(APP.data.tasks||[]).find(x=>x['Mã công việc']===ids[i]);const res=await gas('changeTaskStatus',ids[i],status,status==='Hoàn thành'||status==='Chờ xác nhận'?100:Number(task?.['Tiến độ (%)']||0),task?.['Kết quả']||'',APP.token,{timeout:60000});mergeDataResult(res);updateToast(t,'Đang cập nhật trạng thái',`${i+1}/${ids.length} công việc.`,'processing',0);}closeModal();APP.state.selected.tasks=new Set();updateToast(t,'Đã cập nhật',`${ids.length} công việc đã đổi trạng thái.`,'success',3500);renderCurrentPage();}catch(err){updateToast(t,'Không thể cập nhật',err.message,'error',5500);}};

/* ========================= COMBOBOX ========================= */
let activeCombo=null,comboMenu=null,comboIndex=-1;
let comboScrollRaf=0;
function handleFloatingScroll(e){
  hideTooltipPortal();
  if(!activeCombo||!comboMenu)return;

  // Cuộn ngay bên trong danh sách dropdown: giữ menu mở, không đóng/restore giá trị.
  // Đây là nguyên nhân cũ khiến dropdown "văng ra" ngay khi người dùng lăn chuột.
  const target=e&&e.target;
  if(target===comboMenu || (target&&target.nodeType&&comboMenu.contains(target)))return;

  // Nếu cuộn modal/page chứa combobox, menu dùng position:fixed nên cần bám lại anchor.
  // Throttle bằng requestAnimationFrame để không giật khi cuộn liên tục.
  if(comboScrollRaf)return;
  comboScrollRaf=requestAnimationFrame(()=>{
    comboScrollRaf=0;
    if(!activeCombo||!comboMenu)return;
    const anchor=activeCombo.querySelector('.combo-control');
    if(!anchor||!anchor.isConnected){closeComboMenu(false);return;}
    positionFloating(comboMenu,anchor,true);
  });
}
function openCombo(combo){
  if(!combo)return;
  if(activeCombo===combo&&comboMenu)return;
  if(activeCombo)closeComboMenu(true);
  activeCombo=combo;
  combo.classList.add('open');
  const display=combo.querySelector('.combo-display'),hidden=combo.querySelector('input[type="hidden"]');
  combo._comboSnapshot={label:display?.value||'',value:hidden?.value||''};
  const src=[...combo.querySelectorAll('.combo-source span')].map(x=>({value:x.dataset.value,label:x.dataset.label}));
  combo._options=src;
  renderComboMenu(src,display?.value||'');
}
function filterCombo(combo,text){if(activeCombo!==combo)openCombo(combo);const q=normalizeText(text);const opts=(combo._options||[]).filter(o=>normalizeText(o.label).includes(q)||normalizeText(o.value).includes(q));renderComboMenu(opts,text);}
function renderComboMenu(options){if(!activeCombo)return;if(!comboMenu){comboMenu=document.createElement('div');comboMenu.className='combo-menu';document.body.appendChild(comboMenu);}comboIndex=-1;comboMenu.innerHTML=options.length?options.map((o,i)=>`<div class="combo-option" data-action="combo-select" data-index="${i}" data-value="${escapeAttr(o.value)}" data-label="${escapeAttr(o.label)}">${escapeHtml(o.label)}</div>`).join(''):'<div class="combo-empty">Không tìm thấy lựa chọn phù hợp.</div>';positionFloating(comboMenu,activeCombo.querySelector('.combo-control'),true);}
function selectComboOption(value,label){
  if(!activeCombo)return;
  const combo=activeCombo,display=combo.querySelector('.combo-display'),hidden=combo.querySelector('input[type="hidden"]');
  if(display)display.value=label;
  if(hidden)hidden.value=value;
  if(combo.dataset.wizardCombo==='true'){const r=APP.state.wizard?.rows.find(x=>x.__tempId===combo.dataset.tempid);if(r)r[combo.dataset.wizardName]=value;}
  combo._comboSnapshot={label:String(label??''),value:String(value??'')};
  closeComboMenu(false);
  if(hidden){hidden.dispatchEvent(new Event('input',{bubbles:true}));hidden.dispatchEvent(new Event('change',{bubbles:true}));}
}
function closeComboMenu(restore=true){
  if(activeCombo){
    const combo=activeCombo,snap=combo._comboSnapshot;
    if(restore&&snap){
      const display=combo.querySelector('.combo-display'),hidden=combo.querySelector('input[type="hidden"]');
      if(display)display.value=snap.label||'';
      if(hidden)hidden.value=snap.value||'';
    }
    combo.classList.remove('open');
    delete combo._comboSnapshot;
  }
  activeCombo=null;
  if(comboMenu){comboMenu.remove();comboMenu=null;}
  comboIndex=-1;
}
function handleComboKeyboard(e){if(!comboMenu)return;const options=[...comboMenu.querySelectorAll('.combo-option')];if(e.key==='ArrowDown'){e.preventDefault();comboIndex=Math.min(options.length-1,comboIndex+1);}else if(e.key==='ArrowUp'){e.preventDefault();comboIndex=Math.max(0,comboIndex-1);}else if(e.key==='Enter'&&comboIndex>=0){e.preventDefault();const x=options[comboIndex];selectComboOption(x.dataset.value,x.dataset.label);return;}else if(e.key==='Escape'){e.preventDefault();closeComboMenu(true);return;}else if(e.key==='Tab'){closeComboMenu(true);return;}options.forEach((x,i)=>x.classList.toggle('active',i===comboIndex));if(options[comboIndex])options[comboIndex].scrollIntoView({block:'nearest'});}
function positionFloating(menu,anchor,combo=false){if(!anchor)return;const r=anchor.getBoundingClientRect();const width=Math.max(combo?r.width:190,menu.offsetWidth||0);let left=r.left,top=r.bottom+5;if(left+width>window.innerWidth-8)left=Math.max(8,window.innerWidth-width-8);const h=Math.min(menu.scrollHeight||260,420);if(top+h>window.innerHeight-8)top=Math.max(8,r.top-h-5);menu.style.left=left+'px';menu.style.top=top+'px';if(combo)menu.style.width=r.width+'px';}

/* ========================= MULTI PERSON ========================= */
function multiPersonPicker(key,selected,hint){
  const employees=APP.data.employees||[];
  const set=new Set(selected||[]);
  const allSelected=employees.length>0 && employees.every(e=>set.has(String(e['Mã nhân sự']||'')));
  const chips=[...set].map(id=>`<span class="person-chip">${avatarHtml(id,24)}<span>${escapeHtml(employeeName(id))}</span></span>`).join('');
  const options=employees.map(e=>`<label class="multi-option" data-search="${escapeAttr(normalizeText(e['Mã nhân sự']+' '+e['Họ và tên']+' '+e['Nhóm']))}" style="display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:9px 12px;min-height:44px;cursor:pointer;white-space:normal;">
    <input class="native-person-check" style="appearance:auto !important;-webkit-appearance:checkbox !important;opacity:1 !important;position:static !important;display:inline-block !important;visibility:visible !important;pointer-events:auto !important;flex:0 0 16px;width:16px;height:16px;min-width:16px;margin:0;accent-color:#16a34a;cursor:pointer;" type="checkbox" data-multi-person="${escapeAttr(key)}" value="${escapeAttr(e['Mã nhân sự'])}" ${set.has(String(e['Mã nhân sự']||''))?'checked':''}>
    <span style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex:1;min-width:0;white-space:normal;">
      <span style="display:flex;flex-direction:column;gap:3px;min-width:0;overflow-wrap:anywhere;"><strong style="font-size:13px;line-height:1.35;font-weight:600;">${escapeHtml(e['Họ và tên']||e['Mã nhân sự']||'')}</strong><small class="muted" style="font-size:11px;line-height:1.3;">${escapeHtml(e['Nhóm']||'')}</small></span>
      <small class="muted" style="flex:0 0 auto;font-size:11px;">${escapeHtml(e['Mã nhân sự']||'')}</small>
    </span>
  </label>`).join('');
  return `<div class="selected-chips" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">${chips}</div>
  <div class="multi-select-list refined-multi-select" style="width:100%;min-width:0;box-sizing:border-box;overflow:hidden;border:1px solid var(--border);border-radius:14px;">
    <div class="multi-select-search" style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid var(--border);">
      <span class="material-symbols-rounded">search</span>
      <input data-multi-search="${escapeAttr(key)}" style="width:100%;min-width:0;box-sizing:border-box;" placeholder="Tìm nhân sự theo mã, tên hoặc Nhóm...">
    </div>
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border);background:var(--surface,#f8fafc);">
      <input class="native-person-check" style="appearance:auto !important;-webkit-appearance:checkbox !important;opacity:1 !important;position:static !important;display:inline-block !important;visibility:visible !important;pointer-events:auto !important;flex:0 0 16px;width:16px;height:16px;min-width:16px;margin:0;accent-color:#16a34a;cursor:pointer;" type="checkbox" data-multi-all="${escapeAttr(key)}" ${allSelected?'checked':''}>
      <label for="" style="font-size:13px;line-height:1.4;font-weight:700;cursor:pointer;">Tất cả thành viên <small class="muted" style="display:block;font-weight:400;">Chọn hoặc bỏ chọn toàn bộ ${employees.length} thành viên</small></label>
    </div>
    <div class="multi-options" data-multi-options="${escapeAttr(key)}" style="display:block;width:100%;max-height:220px;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;">${options}</div>
  </div>
  <div class="field-help">${escapeHtml(hint||'Có thể chọn nhiều nhân sự.')}</div>`;
}
function getCheckedPeople(key){return [...document.querySelectorAll(`[data-multi-person="${CSS.escape(key)}"]:checked`)].map(x=>x.value);}
function updateMultiPerson(el){
  const key=el.dataset.multiPerson||el.dataset.multiAll;
  if(!key)return;
  if(el.matches('[data-multi-all]')){
    const checked=el.checked;
    document.querySelectorAll(`[data-multi-person="${CSS.escape(key)}"]`).forEach(cb=>{cb.checked=checked;});
  }else{
    const allBox=document.querySelector(`[data-multi-all="${CSS.escape(key)}"]`);
    if(allBox){
      const boxes=[...document.querySelectorAll(`[data-multi-person="${CSS.escape(key)}"]`)];
      allBox.checked=boxes.length>0&&boxes.every(cb=>cb.checked);
    }
  }
  if(key.startsWith('wizard-part-')){
    const tempId=key.replace('wizard-part-','');
    const r=APP.state.wizard?.rows.find(x=>x.__tempId===tempId);
    if(r)r.__participants=getCheckedPeople(key);
  }
}
function filterMultiOptions(input){const key=input.dataset.multiSearch,q=normalizeText(input.value);document.querySelectorAll(`[data-multi-options="${CSS.escape(key)}"] .multi-option`).forEach(x=>x.classList.toggle('hidden',q&&!x.dataset.search.includes(q)));}

/* ========================= CONFIRM / DELETE ========================= */
function showConfirm(title,message,onConfirm,confirmLabel='Xác nhận'){APP.state.confirmHandler=onConfirm;document.getElementById('confirm-root').innerHTML=`<div class="confirm-overlay"><div class="confirm-box"><div class="confirm-icon"><span class="material-symbols-rounded">warning</span></div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p><div class="confirm-actions"><button class="btn" data-action="close-confirm">Hủy</button><button class="btn btn-danger" id="confirm-ok-btn">${escapeHtml(confirmLabel)}</button></div></div></div>`;document.getElementById('confirm-ok-btn').onclick=async()=>{const fn=APP.state.confirmHandler;closeConfirm();if(fn)await fn();};}
function closeConfirm(){document.getElementById('confirm-root').innerHTML='';APP.state.confirmHandler=null;}
function confirmDelete(module,id,label){showConfirm('Xóa '+label,`Bạn có chắc muốn xóa ${id}? Dữ liệu liên kết có thể làm hệ thống từ chối thao tác xóa.`,async()=>{const t=showToast('Đang xóa '+label,'Hệ thống đang kiểm tra dữ liệu liên kết.','processing',0);try{const res=await gas('deleteRecord',module,id,APP.token,{timeout:60000});mergeDataResult(res);updateToast(t,'Đã xóa '+label,`${id} đã được xóa khỏi database.`,'success',3500);renderCurrentPage();}catch(err){updateToast(t,'Không thể xóa',err.message,'error',5500);}},'Xóa');}
function confirmDeleteFile(id){showConfirm('Xóa tài liệu','File sẽ được chuyển vào Thùng rác Google Drive và metadata chuyển sang Đã xóa.',async()=>{const t=showToast('Đang xóa file','Đang cập nhật Google Drive và danh sách tài liệu.','processing',0);try{const res=await gas('deleteUploadedFile',id,APP.token,{timeout:90000});mergeDataResult(res);updateToast(t,'Đã xóa file','File đã được chuyển vào Thùng rác.','success',3500);renderCurrentPage();}catch(err){updateToast(t,'Không thể xóa file',err.message,'error',5500);}},'Xóa file');}
function confirmCategoryDelete(group,value){showConfirm('Xóa giá trị danh mục',`Xóa "${value}" khỏi nhóm ${group}? Hệ thống sẽ chặn nếu giá trị đang được dùng.`,async()=>{const t=showToast('Đang xóa danh mục','Đang kiểm tra dữ liệu liên quan.','processing',0);try{const res=await gas('deleteCategoryItem',group,value,APP.token,{timeout:45000});mergeDataResult(res);updateToast(t,'Đã xóa giá trị','Danh mục đã được cập nhật.','success',3000);renderCurrentPage();}catch(err){updateToast(t,'Không thể xóa',err.message,'error',5000);}},'Xóa');}

/* ========================= SAVE / PATCH / REFRESH ========================= */
async function saveSimpleRecord(module,data,processing,success){const t=showToast(processing,'Dữ liệu đang được kiểm tra và cập nhật.','processing',0);try{const res=await gas('saveRecord',module,data,APP.token,{timeout:60000});mergeDataResult(res);closeModal();updateToast(t,success,'Giao diện đã được cập nhật mà không tải lại toàn bộ web app.','success',3500);renderCurrentPage();}catch(err){updateToast(t,'Không thể lưu dữ liệu',err.message,'error',5500);}}
const CLIENT_ID_FIELDS={
  employees:'Mã nhân sự',projects:'Mã dự án',projectMembers:'Mã liên kết',tasks:'Mã công việc',
  taskParticipants:'Mã liên kết',kpiTemplates:'Mã mẫu KPI',kpiTemplateDetails:'Mã chỉ tiêu mẫu',
  kpiMonths:'Mã KPI tháng',kpiDetails:'Mã chi tiết KPI',files:'Mã tài liệu',users:'Mã người dùng',audit:'Mã nhật ký'
};
function applyRecordPatch(moduleKey,patch){
  if(!patch)return;
  let rows=Array.isArray(APP.data[moduleKey])?[...APP.data[moduleKey]]:[];
  if(patch.replaceWhere?.field){
    const field=patch.replaceWhere.field,value=String(patch.replaceWhere.value??'');
    rows=rows.filter(r=>String(r?.[field]??'')!==value);
  }
  const idField=CLIENT_ID_FIELDS[moduleKey];
  if(Array.isArray(patch.removeIds)&&patch.removeIds.length&&idField){
    const remove=new Set(patch.removeIds.map(String));
    rows=rows.filter(r=>!remove.has(String(r?.[idField]??'')));
  }
  if(Array.isArray(patch.upsert)&&patch.upsert.length){
    patch.upsert.forEach(record=>{
      if(!record)return;
      if(!idField){rows.push(record);return;}
      const id=String(record[idField]??'');
      const index=rows.findIndex(r=>String(r?.[idField]??'')===id);
      if(index>=0)rows[index]={...rows[index],...record};
      else rows.push(record);
    });
  }
  APP.data[moduleKey]=rows;
}
function mergeDataResult(res){
  if(!res)return;
  if(res.data)APP.data=res.data;
  if(res.dataPatch)Object.entries(res.dataPatch).forEach(([k,v])=>APP.data[k]=v);
  if(res.recordPatch)Object.entries(res.recordPatch).forEach(([k,v])=>applyRecordPatch(k,v));
}
async function syncAutomaticKpiData(kpiId='',options={}){
  const opts=Object.assign({silent:false},options||{});
  let toastId='';
  if(!opts.silent)toastId=showToast('Đang đồng bộ KPI','Hệ thống đang tính lại các chỉ tiêu tự động theo dữ liệu công việc mới nhất.','processing',0);
  try{
    const res=await gas('refreshKpiAutomaticData',kpiId||'',APP.token,{timeout:90000});
    mergeDataResult(res);
    if(toastId)updateToast(toastId,'KPI đã cập nhật','Các chỉ tiêu tự động đã được tính lại theo dữ liệu mới nhất.','success',2200);
    return true;
  }catch(err){
    console.warn('KPI automatic refresh failed',err);
    if(toastId)updateToast(toastId,'Không thể đồng bộ KPI',err.message||'Vui lòng thử lại.','error',5000);
    return false;
  }
}
async function refreshKpiOnPageEntry(page){
  const pageAtStart=page;
  const ok=await syncAutomaticKpiData('',{silent:true});
  if(ok&&APP.state.page===pageAtStart)renderCurrentPage();
}
async function refreshAll(){
  const t=showToast('Đang làm mới dữ liệu','Đang đồng bộ dữ liệu và tính lại các chỉ tiêu KPI tự động.','processing',0);
  try{
    await gas('refreshKpiAutomaticData','',APP.token,{timeout:90000});
    const data=await gas('getBootstrapData',APP.token,{timeout:60000});
    APP.data=data;APP.session=data.session;APP.permissions=data.permissions||{};setUserShell();applyPermissions();renderCurrentPage();
    updateToast(t,'Đã làm mới dữ liệu','Dữ liệu mới nhất và KPI tự động đã được cập nhật.','success',3000);
  }catch(err){updateToast(t,'Không thể làm mới',err.message,'error',5500);}
}

/* ========================= TOAST ========================= */
function showToast(title,message,type='success',auto=3500){
  const id='toast_'+Date.now()+'_'+Math.random().toString(36).slice(2,5);
  const el=document.createElement('div');
  el.id=id; el.className=`toast ${type}`; el.dataset.started=Date.now(); el.dataset.auto=String(auto||0);
  el.innerHTML=toastHtml(title,message,type,'0.0 giây');
  document.getElementById('toast-container')?.appendChild(el);
  startToastClock(el);
  if(auto>0) startToastAutoClose(el,id,auto);
  return id;
}
function updateToast(id,title,message,type='success',auto=3500){
  const el=document.getElementById(id); if(!el)return;
  clearToastTimers(el);
  el.className=`toast ${type}`; el.dataset.auto=String(auto||0);
  const sec=((Date.now()-Number(el.dataset.started||Date.now()))/1000).toFixed(1);
  el.innerHTML=toastHtml(title,message,type,sec+' giây');
  startToastClock(el);
  if(auto>0) startToastAutoClose(el,id,auto);
}
function toastHtml(title,message,type,time){
  const icon=type==='processing'?'sync':type==='success'?'check_circle':type==='warning'?'warning':'error';
  return `<div class="toast-icon"><span class="material-symbols-rounded">${icon}</span></div><div class="toast-copy"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></div><span class="toast-time">${time}</span><div class="toast-progress"><span></span></div>`;
}
function startToastClock(el){
  el._timer=setInterval(()=>{
    const sec=((Date.now()-Number(el.dataset.started||Date.now()))/1000).toFixed(1);
    const x=el.querySelector('.toast-time'); if(x)x.textContent=sec+' giây';
  },100);
}
function startToastAutoClose(el,id,auto){
  const bar=el.querySelector('.toast-progress span'); const start=Date.now();
  el._autoTimer=setInterval(()=>{
    const passed=Date.now()-start; const pct=Math.max(0,100-(passed/auto*100));
    if(bar && !el.classList.contains('processing')) bar.style.width=pct+'%';
    if(passed>=auto) removeToast(id);
  },33);
}
function clearToastTimers(el){if(el._timer)clearInterval(el._timer);if(el._autoTimer)clearInterval(el._autoTimer);}
function removeToast(id){const el=document.getElementById(id);if(el){clearToastTimers(el);el.style.opacity='0';el.style.transform='translateY(8px) scale(.98)';setTimeout(()=>el.remove(),160);}}

/* ========================= THEME / MENU / PERIOD ========================= */
function initTheme(){const saved=localStorage.getItem('sme_theme')||'light';document.documentElement.dataset.theme=saved;updateThemeIcon();}
function toggleTheme(){const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('sme_theme',next);updateThemeIcon();hideEl('user-dropdown');}
function updateThemeIcon(){setText('theme-icon',document.documentElement.dataset.theme==='dark'?'light_mode':'dark_mode');}
function toggleSidebarMobile(){document.getElementById('sidebar')?.classList.toggle('mobile-open');document.getElementById('mobile-sidebar-overlay')?.classList.toggle('show');}
function closeSidebarMobile(){document.getElementById('sidebar')?.classList.remove('mobile-open');document.getElementById('mobile-sidebar-overlay')?.classList.remove('show');}
function toggleFloating(id,anchor){const el=document.getElementById(id);if(!el)return;const open=!el.classList.contains('hidden');['user-dropdown','period-menu','notification-popover'].forEach(x=>hideEl(x));if(!open){el.classList.remove('hidden');positionFloating(el,anchor);applyPermissions();}}
function toggleNotifications(anchor){
  const el=document.getElementById('notification-popover'); if(!el)return;
  const open=!el.classList.contains('hidden');
  ['user-dropdown','period-menu','notification-popover'].forEach(x=>hideEl(x));
  if(open)return;
  el.innerHTML=renderNotificationPopover();
  el.classList.remove('hidden');
  positionFloating(el,anchor);
  const rect=el.getBoundingClientRect();
  if(rect.right>window.innerWidth-10)el.style.left=Math.max(10,window.innerWidth-rect.width-10)+'px';
}
function renderNotificationPopover(){
  const tasks=APP.data.tasks||[];
  const overdue=tasks.filter(isTaskOverdue);
  const waiting=tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận');
  const near=tasks.filter(isTaskNearDue);
  const items=[
    ...overdue.slice(0,4).map(t=>({type:'red',icon:'schedule',title:'Công việc quá hạn',text:t['Tên công việc'],sub:`Hạn ${formatDate(t['Hạn hoàn thành'])} · ${employeeName(t['Mã người phụ trách'])}`,action:'view-task',id:t['Mã công việc']})),
    ...waiting.slice(0,3).map(t=>({type:'orange',icon:'hourglass_top',title:'Chờ xác nhận',text:t['Tên công việc'],sub:`${employeeName(t['Mã người phụ trách'])} đã gửi kiểm tra`,action:APP.permissions.canConfirmTask?'confirm-task':'view-task',id:t['Mã công việc']})),
    ...near.slice(0,3).map(t=>({type:'blue',icon:'event_upcoming',title:'Sắp đến hạn',text:t['Tên công việc'],sub:`Hạn ${formatDate(t['Hạn hoàn thành'])}`,action:'view-task',id:t['Mã công việc']}))
  ].slice(0,8);
  const total=overdue.length+waiting.length+near.length;
  const body=items.length?items.map(it=>`<button class="notification-item" data-action="${it.action}" data-id="${escapeAttr(it.id)}"><span class="notification-item-icon ${it.type}"><span class="material-symbols-rounded">${it.icon}</span></span><span><strong>${escapeHtml(it.title)} · ${escapeHtml(it.text)}</strong><small>${escapeHtml(it.sub)}</small></span><span class="material-symbols-rounded">chevron_right</span></button>`).join(''):emptyState('notifications_none','Không có thông báo','Các việc quá hạn, sắp đến hạn hoặc chờ xác nhận sẽ hiển thị tại đây.');
  return `<div class="notification-popover-head"><div><strong>Thông báo công việc</strong><small>${total} mục cần chú ý trong kỳ đang xem</small></div><span class="badge ${total?'badge-red':'badge-green'}">${total}</span></div><div class="notification-list">${body}</div><div class="notification-popover-foot"><button class="btn btn-sm" data-action="refresh-data"><span class="material-symbols-rounded">refresh</span>Làm mới</button><button class="btn btn-primary btn-sm" data-page="action-center"><span class="material-symbols-rounded">open_in_new</span>Xem tất cả</button></div>`;
}
async function doLogout(){try{await gas('logout',APP.token,{timeout:15000});}catch(e){console.warn('Logout server cleanup failed',e);}clearLocalSession();APP.data={};hideEl('app-container');showLogin();}
function openCustomPeriodModal(){openModal(modalShell('Chọn khoảng thời gian','Dữ liệu sẽ cập nhật ngay theo khoảng ngày được chọn.',`<div class="form-grid"><div class="form-field"><label>Từ ngày</label><input id="custom-from" type="date" value="${toDateInput(APP.state.period.from)}"></div><div class="form-field"><label>Đến ngày</label><input id="custom-to" type="date" value="${toDateInput(APP.state.period.to)}"></div></div>`,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-custom-period">Xem dữ liệu</button>`,'small'));}
function saveCustomPeriod(){const f=parseDate(document.getElementById('custom-from')?.value),t=parseDate(document.getElementById('custom-to')?.value);if(!f||!t||t<f){showToast('Khoảng thời gian không hợp lệ','Ngày kết thúc phải từ ngày bắt đầu trở đi.','error');return;}APP.state.period={key:'custom',label:`${formatDate(f)} - ${formatDate(t)}`,from:startOfDay(f),to:endOfDay(t)};updatePeriodLabel();closeModal();renderCurrentPage();}

/* ========================= TOOLTIP ========================= */
function getFieldTooltip(module,field){if(FIELD_TOOLTIPS[module]?.[field])return FIELD_TOOLTIPS[module][field];if(/^Mã/.test(field))return 'Mã định danh hoặc mã liên kết dùng để kết nối dữ liệu giữa các hồ sơ.';if(/Ngày|Hạn|Kỳ/.test(field))return 'Nhập/chọn đúng thời gian. Dữ liệu được dùng để lọc, cảnh báo và báo cáo.';if(/Trạng thái|Tình trạng/.test(field))return 'Chọn đúng trạng thái để hệ thống lọc, cảnh báo và tổng hợp báo cáo chính xác.';if(/Người|Nhân sự|Quản lý/.test(field))return 'Chọn người liên quan từ danh sách nhân sự hiện có trong hệ thống.';if(/File|Ảnh|Tài liệu|Link/.test(field))return 'Đính kèm tài liệu phù hợp. File đã lưu chỉ được tải nội dung khi người dùng bấm Xem.';if(/Ghi chú/.test(field))return 'Nhập thông tin bổ sung không thuộc các trường chính.';return '';}
function tooltipIcon(text){return text?`<button type="button" class="info-icon" data-tooltip="${escapeAttr(text)}" aria-label="Hướng dẫn"><span class="material-symbols-rounded">info</span></button>`:'';}
function handleTooltipHover(e){const a=e.target.closest('[data-tooltip]');if(a)showTooltipPortal(a,a.dataset.tooltip);}
function handleTooltipOut(e){if(e.target.closest('[data-tooltip]'))hideTooltipPortal();}
function showTooltipPortal(anchor,text){const p=document.getElementById('tooltip-portal');if(!p)return;p.textContent=text;p.classList.remove('hidden');const r=anchor.getBoundingClientRect();const w=Math.min(330,p.offsetWidth||330);let left=r.left,top=r.bottom+7;if(left+w>window.innerWidth-8)left=window.innerWidth-w-8;if(top+p.offsetHeight>window.innerHeight-8)top=r.top-p.offsetHeight-7;p.style.left=Math.max(8,left)+'px';p.style.top=Math.max(8,top)+'px';}
function hideTooltipPortal(){document.getElementById('tooltip-portal')?.classList.add('hidden');}

/* ========================= CHARTS ========================= */
function chartRefPalette(){
  return {
    purple:'#5B4FE9', blue:'#2F80ED', green:'#27AE60', yellow:'#F5B335',
    orange:'#F97316', red:'#F04456', gray:'#AEBBD0', teal:'#24B5A6',
    grid:'rgba(148,163,184,.22)'
  };
}
function chartRefColorForLabel(label,index=0){
  const p=chartRefPalette(),key=normalizeText(label||'');
  if(/qua han|chua dat|kem|huy/.test(key))return p.red;
  if(/cho xac nhan|tam dung/.test(key))return p.yellow;
  if(/hoan thanh|xuat sac|vuot muc tieu|khan/.test(key))return p.green;
  if(/dang thuc hien|tot|binh thuong/.test(key))return p.blue;
  if(/chua bat dau/.test(key))return p.gray;
  if(/can cai thien|yeu|thap/.test(key))return p.orange;
  if(/dat/.test(key))return p.yellow;
  return [p.purple,p.blue,p.green,p.yellow,p.red,p.teal,p.orange,p.gray][index%8];
}
function chartRefDestroy(id){
  if(APP.charts[id]){try{APP.charts[id].destroy();}catch(_){ }delete APP.charts[id];}
}
function chartRefLineGradient(ctx,color){
  const g=ctx.createLinearGradient(0,0,0,260);
  g.addColorStop(0,'rgba(91,79,233,.22)');
  g.addColorStop(.68,'rgba(91,79,233,.08)');
  g.addColorStop(1,'rgba(91,79,233,0)');
  return g;
}
function chartRefCenterPlugin(centerLabel='Tổng'){
  return {
    id:'chartRefCenterText',
    afterDraw(chart){
      if(chart.config.type!=='doughnut')return;
      const meta=chart.getDatasetMeta(0),arc=meta?.data?.[0]; if(!arc)return;
      const {ctx}=chart,total=(chart.data.datasets?.[0]?.data||[]).reduce((s,v)=>s+(Number(v)||0),0);
      ctx.save();
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text').trim()||'#17233d';
      ctx.font='700 24px Roboto, Arial, sans-serif';
      ctx.fillText(String(total),arc.x,arc.y-5);
      ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()||'#66738f';
      ctx.font='600 10px Roboto, Arial, sans-serif';
      ctx.fillText(centerLabel,arc.x,arc.y+17);
      ctx.restore();
    }
  };
}
function chartRefValuePlugin(extra={}){
  return {
    id:'chartRefValueLabels',
    afterDatasetsDraw(chart){
      if(chart.config.type==='doughnut' || extra.showValueLabels===false)return;
      const {ctx}=chart;
      const isHorizontal=chart.options?.indexAxis==='y';
      ctx.save();
      ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text').trim()||'#17233d';
      ctx.font=`700 ${extra.valueFontSize||10}px Roboto, Arial, sans-serif`;
      chart.data.datasets.forEach((ds,di)=>{
        const meta=chart.getDatasetMeta(di); if(meta.hidden)return;
        meta.data.forEach((el,i)=>{
          const raw=Number(ds.data?.[i]); if(!Number.isFinite(raw))return;
          if(chart.config.type==='line' && chart.data.labels.length>10 && i%2)return;
          const pos=el.tooltipPosition();
          const suffix=extra.suffix||'';
          const value=(Math.round(raw*10)/10)+suffix;
          if(isHorizontal){
            ctx.textAlign='left';
            ctx.textBaseline='middle';
            const maxX=(chart.chartArea?.right||pos.x)-ctx.measureText(value).width-6;
            const drawX=Math.min(pos.x+8,maxX);
            ctx.fillText(value,drawX,pos.y);
          }else{
            ctx.textAlign='center';
            ctx.textBaseline='bottom';
            const y=Math.max(13,pos.y-(chart.config.type==='bar'?5:8));
            ctx.fillText(value,pos.x,y);
          }
        });
      });
      ctx.restore();
    }
  };
}
function chartRefDoughnutPercentPlugin(){
  return {
    id:'chartRefDoughnutPercent',
    afterDatasetsDraw(chart){
      if(chart.config.type!=='doughnut')return;
      const ds=chart.data.datasets?.[0]; if(!ds)return;
      const values=ds.data||[],total=values.reduce((s,v)=>s+(Number(v)||0),0); if(!total)return;
      const meta=chart.getDatasetMeta(0),{ctx}=chart;
      ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 10px Roboto, Arial, sans-serif';
      meta.data.forEach((arc,i)=>{
        const val=Number(values[i])||0,pct=val*100/total;if(pct<9)return;
        const angle=(arc.startAngle+arc.endAngle)/2;
        const radius=(arc.innerRadius+arc.outerRadius)/2;
        const x=arc.x+Math.cos(angle)*radius,y=arc.y+Math.sin(angle)*radius;
        const c=Array.isArray(ds.backgroundColor)?ds.backgroundColor[i]:ds.backgroundColor;
        ctx.fillStyle=String(c).toUpperCase()==='#AEBBD0'?'#334155':'#fff';
        ctx.fillText(Math.round(pct)+'%',x,y);
      });
      ctx.restore();
    }
  };
}
function renderPriorityReferenceChart(id,labels,values){
  chartRefDestroy(id);
  const canvas=document.getElementById(id);if(!canvas)return;
  const wrap=canvas.parentElement,total=(values||[]).reduce((s,v)=>s+(Number(v)||0),0);
  const order=['Cao','Thấp','Khẩn','Bình thường'];
  const map=Object.fromEntries((labels||[]).map((l,i)=>[l,Number(values?.[i])||0]));
  const colors={'Cao':'#F04456','Thấp':'#F97316','Khẩn':'#16A36A','Bình thường':'#2F80ED'};
  wrap.innerHTML=`<div class="chart-ref-priority">${order.map(label=>{
    const value=map[label]||0,pct=total?Math.round(value*1000/total)/10:0,color=colors[label];
    return `<button type="button" class="chart-ref-priority-item ${value?'is-clickable':'is-empty'}" style="--ref-color:${color};--ref-pct:${pct*3.6}deg" ${value?`data-action="priority-drilldown" data-priority="${escapeAttr(label)}" title="Xem ${value} công việc ưu tiên ${escapeAttr(label)}"`:'disabled title="Không có công việc trong nhóm này"'}>
      <span class="material-symbols-rounded chart-ref-priority-icon">keyboard_double_arrow_up</span>
      <strong class="chart-ref-priority-label">${escapeHtml(label)}</strong>
      <b class="chart-ref-priority-value">${value}</b>
      <span class="chart-ref-ring"><i>${pct}%</i></span>
      ${value?'<span class="chart-ref-priority-view">Nhấp để xem</span>':''}
    </button>`;
  }).join('')}</div>`;
}
function renderClassificationReferenceChart(id,labels,values){
  chartRefDestroy(id);
  const canvas=document.getElementById(id);if(!canvas)return;
  const wrap=canvas.parentElement,total=(values||[]).reduce((s,v)=>s+(Number(v)||0),0);
  const rows=(labels||[]).map((label,i)=>({label,value:Number(values?.[i])||0,color:chartRefColorForLabel(label,i)}));
  const order=['Vượt mục tiêu','Xuất sắc','Tốt','Đạt','Trung bình','Cần cải thiện','Yếu','Chưa đạt','Kém'];
  rows.sort((a,b)=>{
    const ai=order.findIndex(x=>normalizeText(x)===normalizeText(a.label)),bi=order.findIndex(x=>normalizeText(x)===normalizeText(b.label));
    return (ai<0?999:ai)-(bi<0?999:bi);
  });
  wrap.innerHTML=`<div class="chart-ref-classification">${rows.length?rows.map(r=>{
    const pct=total?Math.round(r.value*1000/total)/10:0;
    return `<div class="chart-ref-class-row">
      <span class="chart-ref-class-name" title="${escapeAttr(r.label)}"><i style="background:${r.color}"></i>${escapeHtml(r.label)}</span>
      <span class="chart-ref-class-track"><b style="width:${pct}%;background:${r.color}"></b></span>
      <strong>${r.value} <em>(${pct}%)</em></strong>
    </div>`;
  }).join(''):'<div class="chart-ref-empty">Chưa có dữ liệu KPI trong kỳ.</div>'}</div>`;
}
function createDepartmentStatusChart(id,tasks){
  const canvas=document.getElementById(id);if(!canvas)return;
  chartRefDestroy(id);
  if(!window.Chart){canvas.parentElement.innerHTML='<div class="chart-fallback">Không thể tải thư viện biểu đồ.</div>';return;}
  const departments=[...new Set((tasks||[]).map(t=>findEmployee(t['Mã người phụ trách'])?.['Nhóm']||'Khác'))];
  const statuses=['Hoàn thành','Đang thực hiện','Chờ xác nhận','Chưa bắt đầu'];
  const p=chartRefPalette(),colors=[p.green,p.blue,p.yellow,'#F36B6B'];
  const datasets=statuses.map((status,si)=>({
    label:status,
    data:departments.map(dep=>{
      const rows=(tasks||[]).filter(t=>(findEmployee(t['Mã người phụ trách'])?.['Nhóm']||'Khác')===dep && t['Trạng thái']!=='Đã hủy');
      if(!rows.length)return 0;
      return Math.round(rows.filter(t=>t['Trạng thái']===status).length*1000/rows.length)/10;
    }),
    backgroundColor:colors[si],borderWidth:0,borderRadius:si===statuses.length-1?4:0,borderSkipped:false
  }));
  const css=getComputedStyle(document.documentElement),text=css.getPropertyValue('--muted').trim()||'#66738f';
  APP.charts[id]=new Chart(canvas,{
    type:'bar',data:{labels:departments,datasets},
    options:{
      responsive:true,maintainAspectRatio:false,animation:{duration:550,easing:'easeOutQuart'},
      interaction:{mode:'index',intersect:false},
      plugins:{
        legend:{display:true,position:'bottom',labels:{color:text,usePointStyle:true,pointStyle:'rectRounded',boxWidth:9,boxHeight:9,padding:13,font:{family:'Roboto, Arial, sans-serif',size:10,weight:'600'}}},
        tooltip:{backgroundColor:'rgba(23,35,61,.96)',padding:10,cornerRadius:9,callbacks:{label:c=>`${c.dataset.label}: ${c.raw}%`}}
      },
      scales:{
        x:{stacked:true,grid:{display:false},ticks:{color:text,font:{family:'Roboto, Arial, sans-serif',size:9.5,weight:'600'},maxRotation:0,minRotation:0}},
        y:{stacked:true,beginAtZero:true,max:100,ticks:{color:text,stepSize:25,callback:v=>v+'%',font:{family:'Roboto, Arial, sans-serif',size:10}},grid:{color:'rgba(148,163,184,.2)',drawBorder:false}}
      }
    }
  });
}

function compactEmployeeChartName(name){
  const raw=String(name||'').trim();
  if(!raw) return 'Chưa rõ';
  if(raw.length<=18) return raw;
  const parts=raw.split(/\s+/).filter(Boolean);
  if(parts.length>=2){
    const short=parts.slice(-2).join(' ');
    if(short.length<=18) return short;
  }
  return raw.slice(0,16)+'…';
}
function buildKpiPeopleChartRows(kpis,employeeMap,maxItems=10){
  return [...(kpis||[])]
    .sort((a,b)=>Number(b['Tổng điểm KPI']||0)-Number(a['Tổng điểm KPI']||0))
    .slice(0,maxItems)
    .map(k=>({
      label: compactEmployeeChartName(employeeMap?.[k['Mã nhân sự']]||k['Mã nhân sự']||'Chưa rõ'),
      fullLabel: employeeMap?.[k['Mã nhân sự']]||k['Mã nhân sự']||'Chưa rõ',
      value: round1(k['Tổng điểm KPI']||0)
    }));
}
function renderKpiPeopleChart(canvasId,kpis,employeeMap,options={}){
  const rows=buildKpiPeopleChartRows(kpis,employeeMap,options.maxItems||10);
  const canvas=document.getElementById(canvasId);
  if(!canvas) return;
  const wrap=canvas.closest('.chart-wrap');
  if(wrap){
    const height=Math.max(280, Math.min(460, 74 + rows.length*34));
    wrap.style.height=height+'px';
  }
  createChart(canvasId,'bar',rows.map(r=>r.label),rows.map(r=>r.value),{
    max:120,
    suffix:options.suffix||' điểm',
    indexAxis:'y',
    valueLabelMode:'bar-end',
    barThickness:18,
    categoryFontSize:10.5,
    valueFontSize:10,
    fullLabels:rows.map(r=>r.fullLabel)
  });
}

function createChart(id,type,labels,values,extra={}){
  const canvas=document.getElementById(id);if(!canvas)return;
  chartRefDestroy(id);
  if(id.includes('priority')){renderPriorityReferenceChart(id,labels,values);return;}
  if(id.includes('kpi-class')){renderClassificationReferenceChart(id,labels,values);return;}
  if(!window.Chart){canvas.parentElement.innerHTML='<div class="chart-fallback">Không thể tải thư viện biểu đồ. Dữ liệu bảng vẫn sử dụng bình thường.</div>';return;}
  const css=getComputedStyle(document.documentElement);
  const text=css.getPropertyValue('--muted').trim()||'#66738f';
  const line=css.getPropertyValue('--line').trim()||'#dfe6f2';
  const p=chartRefPalette(),ctx=canvas.getContext('2d');
  const colors=(labels||[]).map((label,i)=>chartRefColorForLabel(label,i));
  const isLine=type==='line',isDoughnut=type==='doughnut',isBar=type==='bar',isHorizontalBar=isBar&&extra.indexAxis==='y';
  const dataset={
    label:extra.label||'',data:values,
    borderColor:isLine?p.purple:(isDoughnut?'#fff':undefined),
    backgroundColor:isLine?chartRefLineGradient(ctx,p.purple):colors,
    fill:isLine,tension:isLine?0.42:0,borderWidth:isLine?3:(isDoughnut?4:0),
    pointRadius:isLine?4:0,pointHoverRadius:isLine?6:0,pointBackgroundColor:isLine?p.purple:undefined,
    pointBorderColor:isLine?'#fff':undefined,pointBorderWidth:isLine?2:0,
    borderRadius:isBar?8:0,borderSkipped:false,
    barThickness:isBar?(extra.barThickness||(labels.length>9?18:28)):undefined,
    maxBarThickness:isBar?(extra.maxBarThickness||34):undefined,hoverOffset:isDoughnut?4:0
  };
  const centerLabel=id.includes('task-status')?'công việc':id.includes('project-status')?'dự án':'Tổng';
  const baseTickFont={family:'Roboto, Arial, sans-serif',size:extra.categoryFontSize||9.5,weight:'600'};
  const numberTickFont={family:'Roboto, Arial, sans-serif',size:10};
  const config={
    type,data:{labels,datasets:[dataset]},
    plugins:[chartRefValuePlugin(extra),chartRefCenterPlugin(centerLabel),chartRefDoughnutPercentPlugin()],
    options:{
      responsive:true,maintainAspectRatio:false,indexAxis:isHorizontalBar?'y':'x',animation:{duration:600,easing:'easeOutQuart'},
      layout:{padding:isDoughnut?6:{top:isHorizontalBar?8:20,right:isHorizontalBar?16:5,left:isHorizontalBar?2:2,bottom:2}},
      interaction:{mode:isDoughnut?'nearest':'index',intersect:false},
      plugins:{
        legend:{display:isDoughnut,position:'right',labels:{color:text,boxWidth:9,boxHeight:9,usePointStyle:true,pointStyle:'circle',font:{family:'Roboto, Arial, sans-serif',size:10.5,weight:'600'},padding:13}},
        tooltip:{backgroundColor:'rgba(23,35,61,.96)',padding:10,cornerRadius:9,titleFont:{family:'Roboto, Arial, sans-serif',size:11,weight:'700'},bodyFont:{family:'Roboto, Arial, sans-serif',size:10.5},displayColors:true,callbacks:{title:items=>{const item=items?.[0]; if(!item) return ''; return (extra.fullLabels&&extra.fullLabels[item.dataIndex])||item.label||'';},label:c=>`${(extra.fullLabels&&extra.fullLabels[c.dataIndex])?extra.fullLabels[c.dataIndex]+': ':''}${c.raw}${extra.suffix||''}`}}
      },
      cutout:isDoughnut?'65%':undefined,
      scales:isDoughnut?{}:{
        x:isHorizontalBar
          ?{beginAtZero:true,suggestedMax:extra.max||undefined,max:extra.max||undefined,ticks:{color:text,font:numberTickFont,callback:extra.suffix==='%'?v=>v+'%':undefined},grid:{color:line,drawBorder:false},border:{display:false}}
          :{ticks:{color:text,font:baseTickFont,maxRotation:16,minRotation:0},grid:{display:false},border:{display:false}},
        y:isHorizontalBar
          ?{ticks:{color:text,font:baseTickFont},grid:{display:false},border:{display:false}}
          :{beginAtZero:true,suggestedMax:extra.max||undefined,max:extra.max||undefined,ticks:{color:text,font:numberTickFont,callback:extra.suffix==='%'?v=>v+'%':undefined},grid:{color:line,drawBorder:false},border:{display:false}}
      }
    }
  };
  APP.charts[id]=new Chart(canvas,config);
}
function destroyUnusedCharts(){Object.keys(APP.charts).forEach(id=>{if(!document.getElementById(id)){try{APP.charts[id].destroy();}catch(e){}delete APP.charts[id];}});}

/* ========================= DATA / DISPLAY HELPERS ========================= */
function employeeName(id){return findEmployee(id)?.['Họ và tên']||id||'';}
function findEmployee(id){
  const key=String(id||'').trim();
  if(!key)return null;

  // Ưu tiên hồ sơ đầy đủ trong phạm vi dữ liệu được cấp.
  const employee=(APP.data.employees||[]).find(e=>String(e['Mã nhân sự']||'').trim()===key);
  if(employee)return employee;
  const directoryEmployee=(APP.data.employeeDirectory||[]).find(e=>String(e['Mã nhân sự']||'').trim()===key);
  if(directoryEmployee)return directoryEmployee;

  // Dự phòng cho dữ liệu đội/nhóm cũ trong các phiên bản trước.
  // Dữ liệu này được getTeamsForActor_ trả về riêng, không phải quyền xem hồ sơ nhân sự.
  for(const team of (APP.state.teams||[])){
    const member=(team.members||[]).find(m=>String(m.id||m.employeeId||'').trim()===key);
    if(member){
      return {
        'Mã nhân sự':key,
        'Họ và tên':member.name||key,
        'Chức vụ':member.role||'Thành viên',
        'Nhóm':member.group||team.name||'',
        'Ảnh đại diện URL':member.avatarUrl||member.avatar||''
      };
    }
    if(String(team.managerId||'').trim()===key){
      const manager=(team.members||[]).find(m=>String(m.id||m.employeeId||'').trim()===key);
      return {
        'Mã nhân sự':key,
        'Họ và tên':team.managerName||manager?.name||key,
        'Chức vụ':manager?.role||'Quản lý',
        'Nhóm':manager?.group||team.name||'',
        'Ảnh đại diện URL':team.managerAvatar||manager?.avatarUrl||manager?.avatar||''
      };
    }
  }
  return null;
}
function employeeNameMap(){
  const map=Object.fromEntries((APP.data.employeeDirectory||[]).map(e=>[e['Mã nhân sự'],e['Họ và tên']]));
  (APP.data.employees||[]).forEach(e=>{if(e['Mã nhân sự'])map[e['Mã nhân sự']]=e['Họ và tên']||e['Mã nhân sự'];});
  (APP.state.teams||[]).forEach(team=>(team.members||[]).forEach(m=>{
    const id=String(m.id||m.employeeId||'').trim();
    if(id&&!map[id])map[id]=m.name||id;
  }));
  return map;
}function projectName(id){return (APP.data.projects||[]).find(p=>p['Mã dự án']===id)?.['Tên dự án']||id||'';}function userName(id){return (APP.data.users||[]).find(u=>u['Mã người dùng']===id)?.['Tên đăng nhập']||id||'';}function kpiDetails(id){return (APP.data.kpiDetails||[]).filter(d=>d['Mã KPI tháng']===id);}function filesFor(module,id){return (APP.data.files||[]).filter(f=>f['Module liên quan']===module&&f['Mã bản ghi liên quan']===id&&f['Trạng thái']!=='Đã xóa');}
function personInline(id){return `<div class="person-inline">${avatarHtml(id,28)}<span>${escapeHtml(employeeName(id)||'-')}</span></div>`;}
function avatarHtml(id,size=34){
  const e=findEmployee(id),name=e?.['Họ và tên']||id||'?';
  const fontSize=Math.max(8,Math.round(size*.31));
  const direct=employeeDirectAvatarSrc(e);
  if(direct) return `<span class="avatar avatar-photo" style="width:${size}px;height:${size}px;font-size:${fontSize}px" title="${escapeAttr(name)}"><img src="${escapeAttr(direct)}" alt="${escapeAttr(name)}"></span>`;
  const raw=String(e?.['Ảnh đại diện URL']||'').trim();
  const m=raw.match(/^drive-file:(.+)$/i);
  if(m&&m[1]){
    return `<span class="avatar avatar-photo avatar-lazy" data-avatar-file-id="${escapeAttr(m[1])}" data-avatar-employee-id="${escapeAttr(id||'')}" style="width:${size}px;height:${size}px;font-size:${fontSize}px" title="${escapeAttr(name)}">${escapeHtml(initials(name))}</span>`;
  }
  return `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${fontSize}px" title="${escapeAttr(name)}">${escapeHtml(initials(name))}</span>`;
}
function initials(name){const parts=String(name||'?').trim().split(/\s+/).filter(Boolean);return ((parts[parts.length-1]?.[0]||'')+(parts.length>1?(parts[0]?.[0]||''):'')).toUpperCase();}
function statusBadge(status){const s=status||'Chưa xếp loại';let c=STATUS_COLORS[s]||(/Lỗi|Quá hạn|Chưa đạt|Cần bổ sung/.test(s)?'red':/Hợp lệ|Thành công/.test(s)?'green':'gray');return `<span class="badge badge-${c}">${escapeHtml(s)}</span>`;}
function isTaskOverdue(t){if(!t||['Hoàn thành','Đã hủy'].includes(t['Trạng thái']))return false;const due=parseDate(t['Hạn hoàn thành']);return due&&endOfDay(due)<new Date();}function isTaskNearDue(t){if(!t||['Hoàn thành','Đã hủy'].includes(t['Trạng thái']))return false;const due=parseDate(t['Hạn hoàn thành']),now=startOfDay(new Date());return due&&due>=now&&due<=new Date(now.getTime()+7*86400000);}function isProjectLate(p){if(!p||['Hoàn thành','Đã hủy'].includes(p['Trạng thái']))return false;const due=parseDate(p['Ngày dự kiến kết thúc']);return due&&endOfDay(due)<new Date();}
function taskOnTimeRate(tasks){const done=tasks.filter(t=>t['Trạng thái']==='Hoàn thành');if(!done.length)return 0;const ok=done.filter(t=>{const a=parseDate(t['Ngày hoàn thành thực tế']),b=parseDate(t['Hạn hoàn thành']);return a&&b&&a<=endOfDay(b);}).length;return round1(ok*100/done.length);}
function countBy(rows,field){return (rows||[]).reduce((o,r)=>{const k=r[field]||'Khác';o[k]=(o[k]||0)+1;return o;},{});}function unique(a){return [...new Set(a||[])];}function clamp(n,min,max){return Math.min(max,Math.max(min,Number(n)||0));}function round1(n){return Math.round((Number(n)||0)*10)/10;}
function normalizeText(s){return String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();}
function parseDate(v){if(!v)return null;if(v instanceof Date)return isNaN(v)?null:v;const s=String(v).trim();let m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)return new Date(+m[3],+m[2]-1,+m[1]);m=s.match(/^(\d{1,2})\/(\d{4})$/);if(m)return new Date(+m[2],+m[1]-1,1);const d=new Date(s);return isNaN(d)?null:d;}
function parseImportDate(v){if(v instanceof Date)return v;const s=String(v||'').trim();let m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);if(m)return new Date(+m[3],+m[2]-1,+m[1]);const d=new Date(s);return isNaN(d)?null:d;}
function formatDate(v){const d=parseDate(v);return d?`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`:'';}function formatDateTime(v){const d=parseDate(v);return d?`${formatDate(d)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`:'';}function formatPeriod(v){const d=parseDate(v);return d?`${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`:'';}function toDateInput(v){const d=parseDate(v);return d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'';}
function startOfDay(d){d=new Date(d);d.setHours(0,0,0,0);return d;}function endOfDay(d){d=new Date(d);d.setHours(23,59,59,999);return d;}function startOfMonth(d){return new Date(d.getFullYear(),d.getMonth(),1);}function endOfMonth(d){return new Date(d.getFullYear(),d.getMonth()+1,0,23,59,59);}function startOfQuarter(d){const m=Math.floor(d.getMonth()/3)*3;return new Date(d.getFullYear(),m,1);}function endOfQuarter(d){const m=Math.floor(d.getMonth()/3)*3;return new Date(d.getFullYear(),m+3,0,23,59,59);}function sameMonth(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth();}function sameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function lastMonths(n){const now=new Date();return Array.from({length:n},(_,i)=>new Date(now.getFullYear(),now.getMonth()-(n-1-i),1));}
function formatPhoneRaw(v){return normalizePhoneForSave(v);}function formatPhone(v){return formatPhoneRaw(v);}function formatFileSize(bytes){bytes=Number(bytes||0);if(bytes<1024)return bytes+' B';if(bytes<1024*1024)return (bytes/1024).toFixed(1)+' KB';return (bytes/1024/1024).toFixed(1)+' MB';}function fileIcon(mime){mime=String(mime||'');if(mime.startsWith('image/'))return'image';if(mime.includes('pdf'))return'picture_as_pdf';if(mime.includes('sheet')||mime.includes('excel'))return'table_view';if(mime.includes('word')||mime.includes('document'))return'description';if(mime.startsWith('text/')||mime.includes('json'))return'code';if(mime.includes('zip')||mime.includes('compressed'))return'folder_zip';return'attach_file';}
function emptyState(icon,title,text){return `<div class="empty-state"><span class="material-symbols-rounded">${icon}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p></div>`;}function categoryUsageLabel(group,value){const map={'Nhóm':()=>`${(APP.data.employees||[]).filter(x=>x['Nhóm']===value).length} nhân sự`,'Chức vụ':()=>`${(APP.data.employees||[]).filter(x=>x['Chức vụ']===value).length} nhân sự`,'Loại dự án':()=>`${(APP.data.projects||[]).filter(x=>x['Loại dự án']===value).length} dự án`,'Nhóm công việc':()=>`${(APP.data.tasks||[]).filter(x=>x['Nhóm công việc']===value).length} công việc`,'Nhóm KPI':()=>`${(APP.data.kpiTemplateDetails||[]).filter(x=>x['Nhóm KPI']===value).length} chỉ tiêu`,'Đơn vị tính':()=>`${(APP.data.kpiTemplateDetails||[]).filter(x=>x['Đơn vị tính']===value).length} chỉ tiêu`,'Loại tài liệu':()=>`${(APP.data.files||[]).filter(x=>x['Loại tài liệu']===value).length} tài liệu`};return map[group]?map[group]():'Dữ liệu phân loại';}
function setButtonBusy(btn,busy,label){if(!btn)return;if(busy){btn.dataset.old=btn.innerHTML;btn.disabled=true;btn.innerHTML=`<span>${escapeHtml(label||'Đang xử lý')}</span><span class="spinner" style="width:16px;height:16px;border-width:2px"></span>`;}else{btn.disabled=false;if(btn.dataset.old)btn.innerHTML=btn.dataset.old;}}
function safeFileName(s){return String(s||'du_lieu').replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,'_');}
function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}function escapeAttr(s){return escapeHtml(s).replace(/`/g,'&#96;');}
function updateActionCounts(){const tasks=APP.data.tasks||[],count=tasks.filter(t=>isTaskOverdue(t)||t['Trạng thái']==='Chờ xác nhận'||isTaskNearDue(t)).length;setText('nav-action-count',count);setText('notification-count',count);const pop=document.getElementById('notification-popover');if(pop&&!pop.classList.contains('hidden'))pop.innerHTML=renderNotificationPopover();}

/* route utility extras */
function toggleHelpItem(el){const item=el.closest('.help-item'),content=item?.querySelector('.help-item-content'),icon=el.querySelector('.material-symbols-rounded');if(content){content.classList.toggle('hidden');if(icon)icon.textContent=content.classList.contains('hidden')?'expand_more':'expand_less';}}

// Period trigger and sidebar shell bindings are handled through delegated actions below.
document.getElementById('period-trigger')?.addEventListener('click',e=>toggleFloating('period-menu',e.currentTarget));
document.getElementById('user-menu-trigger')?.addEventListener('click',e=>toggleFloating('user-dropdown',e.currentTarget));
document.getElementById('collapse-sidebar')?.addEventListener('click',()=>document.getElementById('sidebar')?.classList.toggle('collapsed'));
document.getElementById('menu-toggle')?.addEventListener('click',()=>toggleSidebarMobile());
document.getElementById('mobile-sidebar-overlay')?.addEventListener('click',()=>closeSidebarMobile());
document.getElementById('loading-retry')?.addEventListener('click',()=>{ if(APP.token){ loadBootstrap().catch(showStartupError); } else { location.reload(); } });
document.getElementById('toggle-password')?.addEventListener('click',()=>{const i=document.getElementById('login-password'),ic=document.querySelector('#toggle-password span');if(i){i.type=i.type==='password'?'text':'password';if(ic)ic.textContent=i.type==='password'?'visibility':'visibility_off';}});
document.querySelectorAll('#period-menu [data-period]').forEach(btn=>btn.addEventListener('click',()=>{initPeriod(btn.dataset.period);hideEl('period-menu');renderCurrentPage();}));
/* ===================== UX/UI FIX PATCH 2 - 2026-08-10 =====================
   Bản vá này chỉ ghi đè giao diện/luồng tương tác phía client. Code.gs không đổi.
============================================================================ */

function ensurePatchState(){
  APP.state.calendarView = APP.state.calendarView || 'month';
}

async function handleClick(e){
  const clickedCombo=e.target.closest('.combo');
  const clickedComboMenu=e.target.closest('.combo-menu');
  if(activeCombo&&!clickedCombo&&!clickedComboMenu) closeComboMenu(true);
  const action=e.target.closest('[data-action]');
  if(action){
    e.preventDefault();
    if(action.dataset.action==='calendar-view'){
      APP.state.calendarView=action.dataset.view||'month';
      renderCurrentPage();
      return;
    }
    await routeAction(action.dataset.action,action,e);
    return;
  }
  const nav=e.target.closest('[data-page]');
  if(nav){ e.preventDefault(); changePage(nav.dataset.page); return; }
  const combo=clickedCombo;
  if(combo && !e.target.closest('.combo-option')) openCombo(combo);
  if(!e.target.closest('#user-dropdown')&&!e.target.closest('#user-menu-trigger')) hideEl('user-dropdown');
  if(!e.target.closest('#period-menu')&&!e.target.closest('#period-trigger')) hideEl('period-menu');
  if(!e.target.closest('#notification-popover')&&!e.target.closest('[data-action="toggle-notifications"]')) hideEl('notification-popover');
}

function setPageNo(module,page){
  const p=Number(page);
  if(!Number.isFinite(p)) return;
  APP.state.pageNo[module]=Math.max(1,p);
  renderCurrentPage();
}

function getModuleIdField(module){
  return ({projects:'Mã dự án',tasks:'Mã công việc',employees:'Mã nhân sự',users:'Mã người dùng',kpiMonths:'Mã KPI tháng',kpiTemplates:'Mã mẫu KPI',files:'Mã tài liệu',categories:'Giá trị'})[module] || 'id';
}
function getModuleBaseRows(module){
  if(module==='projects')return APP.data.projects||[];
  if(module==='tasks'){
    let rows=APP.data.tasks||[];
    if(APP.state.taskTab==='mine') rows=rows.filter(t=>t['Mã người phụ trách']===APP.session.employeeId || (APP.data.taskParticipants||[]).some(p=>p['Mã công việc']===t['Mã công việc']&&p['Mã nhân sự']===APP.session.employeeId));
    if(APP.state.taskTab==='waiting') rows=rows.filter(t=>t['Trạng thái']==='Chờ xác nhận');
    return periodFilter(rows,'Hạn hoàn thành');
  }
  if(module==='employees')return APP.data.employees||[];
  if(module==='users')return APP.data.users||[];
  if(module==='kpiMonths')return periodFilter(APP.data.kpiMonths||[],'Kỳ');
  if(module==='kpiTemplates')return APP.data.kpiTemplates||[];
  if(module==='files')return APP.data.files||[];
  return APP.data[module]||[];
}
function getModuleVisibleRows(module){
  let rows=getModuleBaseRows(module);
  const fieldsMap={
    projects:['Mã dự án','Tên dự án','Loại dự án','Mã người phụ trách','Trạng thái','Mức độ ưu tiên'],
    tasks:['Mã công việc','Tên công việc','Mã dự án','Nhóm công việc','Mã người phụ trách','Trạng thái','Mức độ ưu tiên'],
    employees:['Mã nhân sự','Họ và tên','Nhóm','Chức vụ','Email','Số điện thoại','Trạng thái'],
    users:['Mã người dùng','Tên đăng nhập','Vai trò','Mã nhân sự','Trạng thái'],
    kpiMonths:['Mã KPI tháng','Mã nhân sự','Trạng thái KPI','Xếp loại'],
    kpiTemplates:['Mã mẫu KPI','Tên mẫu KPI','Phạm vi áp dụng','Trạng thái'],
    files:['Mã tài liệu','Module liên quan','Mã bản ghi liên quan','Tên file','Loại tài liệu']
  };
  rows=applySearchFilter(module,rows,fieldsMap[module]||Object.keys(rows?.[0]||{}));
  rows=applyGenericFilters(module,rows);
  const sortField={projects:'Ngày tạo',tasks:'Ngày tạo',employees:'Mã nhân sự',users:'Tên đăng nhập',kpiMonths:'Kỳ',kpiTemplates:'Ngày hiệu lực',files:'Ngày upload'}[module];
  if(sortField)rows=sortRows(module,rows,sortField);
  return paginate(module,rows);
}
function toggleRowSelection(module,id,checked){
  APP.state.selected[module]=APP.state.selected[module]||new Set();
  if(checked) APP.state.selected[module].add(id); else APP.state.selected[module].delete(id);
  renderCurrentPage();
}
function toggleSelectAll(module,checked){
  const idField=getModuleIdField(module);
  const visible=getModuleVisibleRows(module).map(r=>r[idField]).filter(Boolean);
  APP.state.selected[module]=APP.state.selected[module]||new Set();
  if(checked){
    APP.state.selected[module]=new Set(visible);
  }else{
    visible.forEach(id=>APP.state.selected[module].delete(id));
  }
  renderCurrentPage();
}
function visibleSelectionState(module,rows){
  const idField=getModuleIdField(module);
  const ids=(rows||[]).map(r=>r[idField]).filter(Boolean);
  const selected=APP.state.selected[module]||new Set();
  return {ids, all:ids.length>0 && ids.every(id=>selected.has(id)), some:ids.some(id=>selected.has(id))};
}
function bulkBar(module,count,actions){
  return `<div class="bulk-bar bulk-bar-v2"><div><strong>Đã chọn ${count} bản ghi</strong><small>Thao tác áp dụng cho các dòng đang được chọn trong trang hiện tại.</small></div><div class="bulk-actions">${actions.map(([a,l,ic])=>`<button class="btn btn-sm bulk-${a}" data-action="bulk-action" data-module="${module}" data-bulk="${a}"><span class="material-symbols-rounded">${ic}</span>${l}</button>`).join('')}</div></div>`;
}

function computedFilterValue(row,field){
  if(field==='Tình trạng hạn') return isTaskOverdue(row)?'Quá hạn':isTaskNearDue(row)?'Sắp đến hạn':'Bình thường';
  if(field==='Có tài liệu'){
    const id=row['Mã công việc']||row['Mã dự án']||row['Mã nhân sự']||row['Mã KPI tháng']||'';
    const module=row['Mã công việc']?'Công việc':row['Mã dự án']?'Dự án':row['Mã nhân sự']?'Nhân sự':row['Mã KPI tháng']?'KPI tháng':'';
    return filesFor(module,id).length?'Có':'Không';
  }
  return row[field];
}
function applyGenericFilters(module,rows){
  const f=APP.state.filters[module]||{};
  return rows.filter(r=>Object.entries(f).every(([field,set])=>!set.size || set.has(String(computedFilterValue(r,field)??''))));
}
function moduleToolbar(module,filterSpecs,actions='',viewToggle=false){
  APP.state.filterSpecs=APP.state.filterSpecs||{};APP.state.filterSpecs[module]=filterSpecs||[];
  const filters=APP.state.filters[module]||{};
  const chips=Object.entries(filters).flatMap(([field,set])=>[...set].map(v=>`<span class="filter-chip">${escapeHtml(field)}: ${escapeHtml(labelForFilter(field,v))}<button data-action="remove-filter" data-module="${module}" data-field="${escapeAttr(field)}" data-value="${encodeURIComponent(v)}"><span class="material-symbols-rounded">close</span></button></span>`)).join('');
  const views=viewToggle?`<div class="view-controls">${module==='projects'?viewButtons('projects',['cards','table']):module==='employees'?viewButtons('employees',['cards','table']):module==='kpiMonths'?viewButtons('kpi',['cards','table']):''}</div>`:'';
  return `<div class="panel module-toolbar module-toolbar-v2"><div class="toolbar-left"><div class="search-box"><span class="material-symbols-rounded">search</span><input data-search-module="${module}" value="${escapeAttr(APP.state.search[module]||'')}" placeholder="Tìm theo mã, tên, người phụ trách..."></div>${filterSpecs?.length?`<button class="filter-btn filter-btn-v2" data-action="apply-filter" data-module="${module}"><span class="material-symbols-rounded">tune</span>Bộ lọc nâng cao</button>`:''}${chips}</div><div class="toolbar-right">${views}<select data-sort="${module}" class="soft-select"><option value="newest" ${(APP.state.sort[module]||'newest')==='newest'?'selected':''}>Mới nhất</option><option value="oldest" ${APP.state.sort[module]==='oldest'?'selected':''}>Cũ nhất</option></select><select data-page-size="${module}" class="soft-select">${[10,50,100].map(n=>`<option value="${n}" ${(APP.state.pageSize[module]||10)===n?'selected':''}>${n} dòng</option>`).join('')}</select></div></div>`;
}

function renderTasks(){
  const module='tasks';let rows=getModuleBaseRows(module);
  rows=applySearchFilter(module,rows,['Mã công việc','Tên công việc','Mã dự án','Nhóm công việc','Mã người phụ trách','Trạng thái','Mức độ ưu tiên']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Ngày tạo');
  const actions=[APP.permissions.canCreateTask?`<button class="btn btn-primary" data-action="new-task"><span class="material-symbols-rounded">add_task</span>Giao công việc</button>`:'',APP.permissions.canImport?`<button class="btn" data-action="open-import" data-module="tasks"><span class="material-symbols-rounded">upload_file</span>Import</button>`:'',`<button class="btn" data-action="export-xlsx" data-module="tasks"><span class="material-symbols-rounded">download</span>Export</button>`].join('');
  const tabs=`<div class="subtabs"><button class="${APP.state.taskTab==='all'?'active':''}" data-action="tab-switch" data-group="taskTab" data-value="all">Tất cả công việc</button><button class="${APP.state.taskTab==='mine'?'active':''}" data-action="tab-switch" data-group="taskTab" data-value="mine">Công việc của tôi</button><button class="${APP.state.taskTab==='waiting'?'active':''}" data-action="tab-switch" data-group="taskTab" data-value="waiting">Chờ xác nhận</button></div>`;
  const toolbar=moduleToolbar(module,[['Trạng thái',APP.data.fixedOptions?.taskStatus||[]],['Tình trạng hạn',['Quá hạn','Sắp đến hạn','Bình thường']],['Mức độ ưu tiên',APP.data.fixedOptions?.priority||[]],['Nhóm công việc',APP.data.categories?.['Nhóm công việc']||[]],['Mã dự án',(APP.data.projects||[]).map(p=>p['Mã dự án'])],['Mã người phụ trách',(APP.data.employees||[]).map(e=>e['Mã nhân sự'])],['Có tài liệu',['Có','Không']]],'',false);
  const selected=APP.state.selected[module]||new Set();const bulk=selected.size?bulkBar(module,selected.size,[['export','Xuất đã chọn','download'],...(APP.permissions.canConfirmTask?[['status','Đổi trạng thái','sync_alt']]:[]),...(APP.permissions.canDelete?[['delete','Xóa bản ghi đã chọn','delete']]:[])]):'';
  const pageRows=paginate(module,rows);
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Công việc','Theo dõi trách nhiệm chính, người tham gia, hạn hoàn thành và luồng xác nhận',actions)}<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">${tabs}</div>${toolbar}${bulk}<div class="panel table-panel table-panel-v2">${renderTasksTable(pageRows,module,true)}${tableFooter(module,rows.length)}</div></div>`;
}
function renderTasksTable(rows,module='tasks',selectable=true){
  if(!rows.length)return emptyState('task_alt','Không có công việc','Không tìm thấy công việc phù hợp với kỳ hoặc bộ lọc đang chọn.');
  const state=visibleSelectionState(module,rows);
  return `<div class="data-table-wrap"><table class="data-table data-table-v2 task-table" style="min-width:1220px"><thead><tr>${selectable?`<th class="select-col"><input class="check" type="checkbox" data-select-all data-module="${module}" ${state.all?'checked':''}></th>`:''}<th style="width:154px">Thao tác</th><th>Công việc</th><th>Dự án</th><th>Người phụ trách</th><th>Hạn hoàn thành</th><th>Ưu tiên</th><th>Trạng thái</th><th>Tiến độ</th></tr></thead><tbody>${rows.map(t=>{const overdue=isTaskOverdue(t);const id=t['Mã công việc'];return `<tr>${selectable?`<td class="select-col"><input class="check" type="checkbox" data-row-select data-module="${module}" data-id="${id}" ${isSelected(module,id)?'checked':''}></td>`:''}<td><div class="row-actions row-actions-color"><button class="row-action view" data-action="view-task" data-id="${id}" title="Xem hồ sơ"><span class="material-symbols-rounded">visibility</span></button>${canEditTask(t)?`<button class="row-action edit" data-action="edit-task" data-id="${id}" title="Sửa"><span class="material-symbols-rounded">edit</span></button>`:''}${t['Trạng thái']==='Chờ xác nhận'&&APP.permissions.canConfirmTask?`<button class="row-action confirm" data-action="confirm-task" data-id="${id}" title="Xác nhận"><span class="material-symbols-rounded">fact_check</span></button>`:`<button class="row-action status" data-action="task-status" data-id="${id}" title="Cập nhật trạng thái"><span class="material-symbols-rounded">sync_alt</span></button>`}${APP.permissions.canSendReminders&& !['Hoàn thành','Đã hủy'].includes(t['Trạng thái'])?`<button class="row-action reminder" data-action="send-task-reminder" data-id="${id}" title="Gửi nhắc việc"><span class="material-symbols-rounded">notifications_active</span></button>`:''}</div></td><td class="main-cell"><strong>${escapeHtml(t['Tên công việc'])}</strong><small>${escapeHtml(id)} · ${escapeHtml(t['Nhóm công việc'])}</small></td><td><strong style="font-size:11.5px">${escapeHtml(projectName(t['Mã dự án']))}</strong><small style="display:block;color:var(--muted)">${escapeHtml(t['Mã dự án'])}</small></td><td>${personInline(t['Mã người phụ trách'])}</td><td class="${overdue?'text-danger':''}"><strong style="font-size:11.5px">${formatDate(t['Hạn hoàn thành'])}</strong>${overdue?'<small style="display:block">Quá hạn</small>':''}</td><td>${statusBadge(t['Mức độ ưu tiên'])}</td><td>${statusBadge(overdue?'Quá hạn':t['Trạng thái'])}</td><td><div style="min-width:110px"><div class="progress"><span style="width:${clamp(Number(t['Tiến độ (%)']||0),0,100)}%"></span></div><small style="display:block;margin-top:3px;color:var(--muted)">${round1(t['Tiến độ (%)']||0)}%</small></div></td></tr>`}).join('')}</tbody></table></div>`;
}



function dashboardFilterModule(tab=APP.state.dashboardTab||'overview'){
  return 'dashboard-'+String(tab||'overview');
}
function dashboardFilterState(tab=APP.state.dashboardTab||'overview'){
  return getFeatureFilterState(dashboardFilterModule(tab));
}
function dashboardDepartmentOptions(){
  return unique((APP.data.employees||[]).map(e=>String(e['Nhóm']||'').trim()).filter(Boolean)).sort((a,b)=>a.localeCompare(b,'vi'));
}
function dashboardEmployeeOptions(){
  return (APP.data.employees||[]).map(e=>({value:e['Mã nhân sự'],label:e['Họ và tên']||e['Mã nhân sự']})).filter(x=>x.value);
}
function dashboardProjectOptions(){
  return (APP.data.projects||[]).map(p=>({value:p['Mã dự án'],label:`${p['Mã dự án']} - ${p['Tên dự án']||''}`})).filter(x=>x.value);
}
function dashboardTemplateOptions(){
  return (APP.data.kpiTemplates||[]).map(t=>({value:t['Mã mẫu KPI'],label:`${t['Mã mẫu KPI']} - ${t['Tên mẫu KPI']||''}`})).filter(x=>x.value);
}
function dashboardFilterSpecs(tab=APP.state.dashboardTab||'overview'){
  const common=[
    {key:'department',label:'Nhóm',options:dashboardDepartmentOptions()},
    {key:'employee',label:tab==='kpi'?'Nhân sự':'Người phụ trách',options:dashboardEmployeeOptions()}
  ];
  if(tab==='tasks') return [
    ...common,
    {key:'project',label:'Dự án',options:dashboardProjectOptions()},
    {key:'group',label:'Nhóm công việc',options:APP.data.categories?.['Nhóm công việc']||[]},
    {key:'priority',label:'Ưu tiên',options:APP.data.fixedOptions?.priority||[]},
    {key:'taskStatus',label:'Trạng thái',options:APP.data.fixedOptions?.taskStatus||[]},
    {key:'due',label:'Tình trạng hạn',options:['Quá hạn','Sắp đến hạn','Bình thường']}
  ];
  if(tab==='kpi') return [
    ...common,
    {key:'kpiStatus',label:'Trạng thái KPI',options:['Đã đánh giá','Đã chốt'].filter(s=>(APP.data.kpiMonths||[]).some(k=>k['Trạng thái KPI']===s))},
    {key:'kpiClass',label:'Xếp loại',options:unique((APP.data.kpiMonths||[]).map(k=>k['Xếp loại']).filter(Boolean))},
    {key:'template',label:'Mẫu KPI',options:dashboardTemplateOptions()}
  ];
  return [
    ...common,
    {key:'project',label:'Dự án',options:dashboardProjectOptions()},
    {key:'priority',label:'Ưu tiên',options:APP.data.fixedOptions?.priority||[]},
    {key:'taskStatus',label:'Trạng thái công việc',options:APP.data.fixedOptions?.taskStatus||[]},
    {key:'kpiStatus',label:'Trạng thái KPI',options:['Đã đánh giá','Đã chốt'].filter(s=>(APP.data.kpiMonths||[]).some(k=>k['Trạng thái KPI']===s))}
  ];
}
function dashboardFilterBar(tab=APP.state.dashboardTab||'overview'){
  const module=dashboardFilterModule(tab),f=getFeatureFilterState(module);
  const controls=dashboardFilterSpecs(tab).map(s=>featureCombo(module,s.key,s.label,f[s.key]||'',s.options||[])).join('');
  const active=featureFilterActiveCount(module);
  const hint=tab==='tasks'?'Lọc số liệu công việc, biểu đồ và bảng chi tiết.':tab==='kpi'?'Lọc hồ sơ KPI, biểu đồ và bảng chi tiết.':'Lọc đồng bộ các chỉ số, biểu đồ và dữ liệu điều hành.';
  return `<section class="panel feature-filter-bar dashboard-filter-bar" aria-label="Bộ lọc Dashboard">
    <div class="feature-filter-top dashboard-filter-top">
      <div class="dashboard-filter-caption"><span class="material-symbols-rounded">filter_alt</span><div><strong>Bộ lọc Dashboard</strong><small>${escapeHtml(hint)}</small></div></div>
      ${active?`<button class="clear-inline-filters feature-clear-btn" type="button" data-action="feature-clear" data-module="${escapeAttr(module)}"><span class="material-symbols-rounded">filter_alt_off</span>Xóa lọc</button>`:''}
    </div>
    <div class="inline-filter-row feature-filter-grid dashboard-filter-grid">${controls}</div>
  </section>`;
}
function dashboardTaskMatchesSearch(t,q){
  if(!q)return true;
  const emp=findEmployee(t['Mã người phụ trách']);
  return normalizeText([t['Mã công việc'],t['Tên công việc'],projectName(t['Mã dự án']),employeeName(t['Mã người phụ trách']),t['Nhóm công việc'],emp?.['Nhóm']].join(' ')).includes(q);
}
function dashboardApplyTaskFilters(rows,filterState){
  const f=filterState||{},q=normalizeText(f.search||'');
  return (rows||[]).filter(t=>{
    const emp=findEmployee(t['Mã người phụ trách']);
    if(!dashboardTaskMatchesSearch(t,q))return false;
    if(f.department&&String(emp?.['Nhóm']||'')!==String(f.department))return false;
    if(f.employee&&String(t['Mã người phụ trách']||'')!==String(f.employee))return false;
    if(f.project&&String(t['Mã dự án']||'')!==String(f.project))return false;
    if(f.group&&String(t['Nhóm công việc']||'')!==String(f.group))return false;
    if(f.priority&&String(t['Mức độ ưu tiên']||'')!==String(f.priority))return false;
    if(f.taskStatus&&String(t['Trạng thái']||'')!==String(f.taskStatus))return false;
    if(f.due&&taskDueState(t)!==String(f.due))return false;
    return true;
  });
}
function dashboardApplyKpiFilters(rows,filterState){
  const f=filterState||{},q=normalizeText(f.search||'');
  return (rows||[]).filter(k=>{
    const emp=findEmployee(k['Mã nhân sự']);
    if(q&&!normalizeText([k['Mã KPI tháng'],employeeName(k['Mã nhân sự']),emp?.['Nhóm'],k['Trạng thái KPI'],k['Xếp loại'],k['Mã mẫu KPI']].join(' ')).includes(q))return false;
    if(f.department&&String(emp?.['Nhóm']||'')!==String(f.department))return false;
    if(f.employee&&String(k['Mã nhân sự']||'')!==String(f.employee))return false;
    if(f.kpiStatus&&String(k['Trạng thái KPI']||'')!==String(f.kpiStatus))return false;
    if(f.kpiClass&&String(k['Xếp loại']||'')!==String(f.kpiClass))return false;
    if(f.template&&String(k['Mã mẫu KPI']||'')!==String(f.template))return false;
    return true;
  });
}
function dashboardApplyProjectFilters(rows,filterState){
  const f=filterState||{},q=normalizeText(f.search||'');
  return (rows||[]).filter(p=>{
    const emp=findEmployee(p['Mã người phụ trách']);
    if(q&&!normalizeText([p['Mã dự án'],p['Tên dự án'],p['Loại dự án'],employeeName(p['Mã người phụ trách']),emp?.['Nhóm'],p['Trạng thái']].join(' ')).includes(q))return false;
    if(f.department&&String(emp?.['Nhóm']||'')!==String(f.department))return false;
    if(f.employee&&String(p['Mã người phụ trách']||'')!==String(f.employee))return false;
    if(f.project&&String(p['Mã dự án']||'')!==String(f.project))return false;
    return true;
  });
}
function dashboardDataContext(tab=APP.state.dashboardTab||'overview'){
  const f=dashboardFilterState(tab);
  const tasks=dashboardApplyTaskFilters(periodFilter(APP.data.tasks||[],'Hạn hoàn thành'),f);
  const projects=dashboardApplyProjectFilters(APP.data.projects||[],f);
  const kpis=dashboardApplyKpiFilters(periodFilter(APP.data.kpiMonths||[],'Kỳ').filter(k=>['Đã đánh giá','Đã chốt'].includes(k['Trạng thái KPI'])),f);
  return {filterState:f,tasks,projects,kpis};
}

function renderDashboard(){
  ensurePatchState();
  const tab=APP.state.dashboardTab||'overview';
  const ctx=dashboardDataContext(tab);
  const tasks=ctx.tasks,projects=ctx.projects,kpis=ctx.kpis;
  const done=tasks.filter(t=>t['Trạng thái']==='Hoàn thành');
  const overdue=tasks.filter(isTaskOverdue);
  const waiting=tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận');
  const completion=tasks.length?round1(done.length*100/tasks.length):0;
  const avgKpi=kpis.length?round1(kpis.reduce((s,k)=>s+Number(k['Tổng điểm KPI']||0),0)/kpis.length):0;
  const exceed=new Set(kpis.filter(k=>Number(k['Tổng điểm KPI']||0)>100).map(k=>String(k['Mã nhân sự']||''))).size;
  const projectAttention=projects.filter(p=>p['Trạng thái']==='Đang thực hiện' && (isProjectLate(p)||Number(p['Tiến độ (%)']||0)<35)).length;
  const tabs=`<div class="panel dashboard-tabs"><button class="${tab==='overview'?'active':''}" data-action="tab-switch" data-group="dashboardTab" data-value="overview"><span class="material-symbols-rounded">dashboard</span>Tổng quan</button><button class="${tab==='tasks'?'active':''}" data-action="tab-switch" data-group="dashboardTab" data-value="tasks"><span class="material-symbols-rounded">checklist</span>Báo cáo công việc</button><button class="${tab==='kpi'?'active':''}" data-action="tab-switch" data-group="dashboardTab" data-value="kpi"><span class="material-symbols-rounded">speed</span>Báo cáo KPI</button></div>`;
  if(tab==='tasks')return renderDashboardTasks(tabs,tasks);
  if(tab==='kpi')return renderDashboardKpi(tabs,kpis);
  const filters=dashboardFilterBar('overview');
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${tabs}${filters}<div class="kpi-grid">
    ${kpiCard('Tổng công việc',tasks.length,'task_alt','blue','01','Theo bộ lọc hiện tại')}${kpiCard('Tỷ lệ hoàn thành',completion+'%','check_circle','green','02',`${done.length} công việc hoàn thành`)}${kpiCard('Quá hạn',overdue.length,'schedule','red','03',overdue.length?'Cần ưu tiên xử lý':'Không có việc quá hạn')}${kpiCard('Chờ xác nhận',waiting.length,'hourglass_top','orange','04',waiting.length?'Quản lý cần kiểm tra':'Đã xử lý hết')}${kpiCard('KPI trung bình',avgKpi+'%','target','violet','05',kpis.length?`${kpis.length} hồ sơ KPI`:'Chưa có KPI phù hợp')}${kpiCard('Nhân sự vượt KPI',exceed,'person_celebrate','green','06',exceed?'Trên 100 điểm':'Chưa ghi nhận')}${kpiCard('Dự án cần chú ý',projectAttention,'warning','orange','07','Theo tiến độ và thời hạn')}${kpiCard('Dự án đang chạy',projects.filter(p=>p['Trạng thái']==='Đang thực hiện').length,'folder_open','blue','08','Theo bộ lọc hiện tại')}
  </div><div class="dashboard-grid dashboard-grid-main"><div class="panel chart-card"><div class="section-title-row"><h2>Xu hướng KPI trung bình theo tháng</h2><small>6 tháng gần nhất</small></div><div class="chart-wrap"><canvas id="chart-kpi-trend"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Tiến độ công việc theo Nhóm</h2><small>Kỳ đang xem</small></div><div class="chart-wrap"><canvas id="chart-department-progress"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Tình trạng công việc</h2><small>${tasks.length} công việc</small></div><div class="chart-wrap"><canvas id="chart-task-status"></canvas></div></div></div><div class="dashboard-grid dashboard-grid-extra"><div class="panel chart-card"><div class="section-title-row"><h2>Công việc theo ưu tiên</h2><small>Ưu tiên xử lý</small></div><div class="chart-wrap"><canvas id="chart-task-priority-extra"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Trạng thái dự án</h2><small>${projects.length} dự án</small></div><div class="chart-wrap"><canvas id="chart-project-status-extra"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Phân loại KPI</h2><small>Kết quả kỳ đang xem</small></div><div class="chart-wrap"><canvas id="chart-kpi-class-extra"></canvas></div></div></div><div class="ops-grid"><div class="panel ops-card"><div class="section-title-row"><h2>Công việc cần xử lý</h2><span class="badge badge-red">${overdue.length+waiting.length}</span></div>${renderMiniTaskTable([...overdue,...waiting].slice(0,7))}<button class="btn btn-sm" data-page="action-center">Xem tất cả việc cần xử lý <span class="material-symbols-rounded">arrow_forward</span></button></div><div class="panel ops-card"><div class="section-title-row"><h2>Cảnh báo vận hành</h2></div>${renderDashboardAlerts(tasks,projects,kpis)}</div><div class="panel ops-card"><div class="section-title-row"><h2>Nhân sự vượt KPI</h2><button class="btn btn-sm" data-page="kpi-month">Xem KPI</button></div>${renderKpiRanking(kpis.filter(k=>Number(k['Tổng điểm KPI']||0)>=90).sort((a,b)=>Number(b['Tổng điểm KPI'])-Number(a['Tổng điểm KPI'])).slice(0,6))}</div></div></div>`;
  requestAnimationFrame(()=>renderDashboardCharts(tasks,kpis,projects,ctx.filterState));
}
function renderDashboardCharts(tasks,kpis,projects=APP.data.projects||[],filterState=dashboardFilterState('overview')){
  const trend=lastMonths(6).map(m=>{
    const rows=dashboardApplyKpiFilters((APP.data.kpiMonths||[]).filter(k=>sameMonth(parseDate(k['Kỳ']),m)&&['Đã đánh giá','Đã chốt'].includes(k['Trạng thái KPI'])),filterState);
    return rows.length?round1(rows.reduce((s,k)=>s+Number(k['Tổng điểm KPI']||0),0)/rows.length):0;
  });
  createChart('chart-kpi-trend','line',lastMonths(6).map(formatPeriod),trend,{max:120,suffix:'%'});
  createDepartmentStatusChart('chart-department-progress',tasks);

  const status=countBy(tasks,'Trạng thái');
  const statusOrder=['Đang thực hiện','Chờ xác nhận','Chưa bắt đầu','Hoàn thành','Đã hủy'];
  const statusLabels=statusOrder.filter(x=>status[x]).concat(Object.keys(status).filter(x=>!statusOrder.includes(x)));
  createChart('chart-task-status','doughnut',statusLabels,statusLabels.map(x=>status[x]||0));

  const pr=countBy(tasks,'Mức độ ưu tiên');
  const priorityLabels=['Cao','Thấp','Khẩn','Bình thường'];
  createChart('chart-task-priority-extra','bar',priorityLabels,priorityLabels.map(x=>pr[x]||0));

  const ps=countBy(projects||[],'Trạng thái');
  const projectOrder=['Hoàn thành','Đang thực hiện','Tạm dừng','Đã hủy','Chưa bắt đầu'];
  const projectLabels=projectOrder.filter(x=>ps[x]).concat(Object.keys(ps).filter(x=>!projectOrder.includes(x)));
  createChart('chart-project-status-extra','doughnut',projectLabels,projectLabels.map(x=>ps[x]||0));

  const kc=countBy(kpis,'Xếp loại');
  createChart('chart-kpi-class-extra','bar',Object.keys(kc),Object.values(kc));
}
function reportMetric(label,value,icon,color,note=''){
  return `<div class="panel report-metric ${color}"><div class="report-metric-icon"><span class="material-symbols-rounded">${icon}</span></div><div><small>${escapeHtml(label)}</small><strong>${value}</strong>${note?`<span>${escapeHtml(note)}</span>`:''}</div></div>`;
}
function renderDashboardTasks(tabs,tasks){
  const filtered=dashboardApplyTaskFilters(tasks,dashboardFilterState('tasks'));
  const done=filtered.filter(t=>t['Trạng thái']==='Hoàn thành'),overdue=filtered.filter(isTaskOverdue),waiting=filtered.filter(t=>t['Trạng thái']==='Chờ xác nhận');
  const byStatus=countBy(filtered,'Trạng thái'),byPriority=countBy(filtered,'Mức độ ưu tiên'),byGroup=countBy(filtered,'Nhóm công việc');
  const byOwner={};filtered.forEach(t=>{const name=employeeName(t['Mã người phụ trách']);byOwner[name]=(byOwner[name]||0)+1;});
  const filters=dashboardFilterBar('tasks');
  document.getElementById('page-content').innerHTML=`<div class="page-shell report-page">${tabs}${pageHead('Báo cáo công việc','Phân tích tình trạng, ưu tiên, nhóm việc và hiệu suất hoàn thành theo kỳ đang xem','')}${filters}<div class="report-metric-grid">${reportMetric('Tổng công việc',filtered.length,'checklist','blue')}${reportMetric('Hoàn thành',done.length,'verified','green',`${filtered.length?round1(done.length*100/filtered.length):0}%`)}${reportMetric('Quá hạn',overdue.length,'schedule','red')}${reportMetric('Chờ xác nhận',waiting.length,'hourglass_top','orange')}${reportMetric('Tỷ lệ đúng hạn',taskOnTimeRate(filtered)+'%','event_available','violet')}</div><div class="dashboard-grid report-chart-grid"><div class="panel chart-card"><div class="section-title-row"><h2>Công việc theo trạng thái</h2></div><div class="chart-wrap"><canvas id="dash-task-status"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Công việc theo ưu tiên</h2></div><div class="chart-wrap"><canvas id="dash-task-priority"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Công việc theo nhóm</h2></div><div class="chart-wrap"><canvas id="dash-task-group"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Khối lượng theo nhân sự</h2></div><div class="chart-wrap"><canvas id="dash-task-owner"></canvas></div></div></div><div class="panel table-panel table-panel-v2"><div class="section-title-row" style="padding:14px 16px 0"><h2>Bảng chi tiết công việc</h2><small>${filtered.length} bản ghi</small></div>${renderTasksTable(filtered.slice(0,30),'dashboardTasks',false)}</div></div>`;
  requestAnimationFrame(()=>{createChart('dash-task-status','doughnut',Object.keys(byStatus),Object.values(byStatus));createChart('dash-task-priority','bar',Object.keys(byPriority),Object.values(byPriority));createChart('dash-task-group','bar',Object.keys(byGroup),Object.values(byGroup));createChart('dash-task-owner','bar',Object.keys(byOwner).slice(0,10),Object.values(byOwner).slice(0,10));});
}
function renderDashboardKpi(tabs,kpis){
  const filtered=dashboardApplyKpiFilters(kpis,dashboardFilterState('kpi'));
  const employeeMap=employeeNameMap();
  const avg=filtered.length?round1(filtered.reduce((s,k)=>s+Number(k['Tổng điểm KPI']||0),0)/filtered.length):0;
  const exceed=new Set(filtered.filter(k=>Number(k['Tổng điểm KPI']||0)>100).map(k=>String(k['Mã nhân sự']||''))).size;
  const pending=filtered.filter(k=>['Đang theo dõi','Chờ quản lý duyệt'].includes(k['Trạng thái KPI'])).length;
  const classCount=countBy(filtered,'Xếp loại'),statusCount=countBy(filtered,'Trạng thái KPI');
  const byDept={};filtered.forEach(k=>{const dep=findEmployee(k['Mã nhân sự'])?.['Nhóm']||'Khác';if(!byDept[dep])byDept[dep]={sum:0,n:0};byDept[dep].sum+=Number(k['Tổng điểm KPI']||0);byDept[dep].n++;});
  const filters=dashboardFilterBar('kpi');
  document.getElementById('page-content').innerHTML=`<div class="page-shell report-page">${tabs}${pageHead('Báo cáo KPI','Theo dõi điểm KPI, xếp loại, trạng thái đánh giá và hiệu suất theo Nhóm','')}${filters}<div class="report-metric-grid">${reportMetric('Hồ sơ KPI',filtered.length,'speed','blue')}${reportMetric('KPI trung bình',avg+'/120','target','violet')}${reportMetric('Vượt mục tiêu',exceed,'person_celebrate','green')}${reportMetric('Cần xử lý',pending,'pending_actions','orange')}${reportMetric('Đã chốt',filtered.filter(k=>k['Trạng thái KPI']==='Đã chốt').length,'lock','blue')}</div><div class="dashboard-grid report-chart-grid"><div class="panel chart-card"><div class="section-title-row"><h2>Điểm KPI theo nhân sự</h2></div><div class="chart-wrap chart-wrap-kpi-people"><canvas id="dash-kpi-people"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Phân loại KPI</h2></div><div class="chart-wrap"><canvas id="dash-kpi-class"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>Trạng thái KPI</h2></div><div class="chart-wrap"><canvas id="dash-kpi-status"></canvas></div></div><div class="panel chart-card"><div class="section-title-row"><h2>KPI trung bình theo Nhóm</h2></div><div class="chart-wrap"><canvas id="dash-kpi-dept"></canvas></div></div></div><div class="panel table-panel table-panel-v2"><div class="section-title-row" style="padding:14px 16px 0"><h2>Bảng chi tiết KPI</h2><small>${filtered.length} hồ sơ</small></div>${renderKpiTable(filtered.slice(0,30))}</div></div>`;
  requestAnimationFrame(()=>{renderKpiPeopleChart('dash-kpi-people',filtered,employeeMap,{maxItems:10,suffix:' điểm'});createChart('dash-kpi-class','doughnut',Object.keys(classCount),Object.values(classCount));createChart('dash-kpi-status','bar',Object.keys(statusCount),Object.values(statusCount));createChart('dash-kpi-dept','bar',Object.keys(byDept),Object.values(byDept).map(x=>round1(x.sum/x.n)),{max:120,suffix:' điểm'});});
}
function renderActionCenter(){
  const tasks=APP.data.tasks||[],kpis=APP.data.kpiMonths||[];const overdue=tasks.filter(isTaskOverdue),waiting=tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận'),near=tasks.filter(isTaskNearDue),kpiPending=kpis.filter(k=>['Chờ quản lý duyệt','Đã đánh giá'].includes(k['Trạng thái KPI']));
  document.getElementById('page-content').innerHTML=`<div class="page-shell action-center-v2">${pageHead('Việc cần xử lý','Bảng điều phối ưu tiên theo hạn, xác nhận và KPI cần hành động')}<div class="action-summary-grid">${reportMetric('Quá hạn',overdue.length,'schedule','red','Cần xử lý trước')}${reportMetric('Chờ xác nhận',waiting.length,'hourglass_top','orange','Quản lý kiểm tra')}${reportMetric('Sắp đến hạn',near.length,'event_upcoming','blue','Trong 7 ngày')}${reportMetric('KPI cần xử lý',kpiPending.length,'speed','violet','Đánh giá/chốt')}</div><div class="action-board"><section class="panel action-lane danger"><div class="lane-head"><div><h2>Công việc quá hạn</h2><small>${overdue.length} mục cần ưu tiên</small></div><span class="badge badge-red">${overdue.length}</span></div>${renderActionCardsV2(overdue,'danger')}</section><section class="panel action-lane warning"><div class="lane-head"><div><h2>Chờ quản lý xác nhận</h2><small>Nhóm đã gửi kết quả</small></div><span class="badge badge-orange">${waiting.length}</span></div>${renderActionCardsV2(waiting,'warning')}</section><section class="panel action-lane info"><div class="lane-head"><div><h2>Sắp đến hạn</h2><small>Theo dõi 7 ngày tới</small></div><span class="badge badge-blue">${near.length}</span></div>${renderActionCardsV2(near,'info')}</section><section class="panel action-lane kpi"><div class="lane-head"><div><h2>KPI cần xử lý</h2><small>Đánh giá hoặc chốt KPI</small></div><span class="badge badge-violet">${kpiPending.length}</span></div>${kpiPending.length?kpiPending.slice(0,12).map(k=>`<article class="action-ticket kpi"><div class="ticket-icon"><span class="material-symbols-rounded">speed</span></div><div class="ticket-main"><strong>${escapeHtml(employeeName(k['Mã nhân sự']))}</strong><p>${formatPeriod(k['Kỳ'])} · ${escapeHtml(k['Trạng thái KPI'])} · ${round1(k['Tổng điểm KPI']||0)}/120</p></div><button class="row-action view" data-action="${k['Trạng thái KPI']==='Đã đánh giá'?'finalize-kpi':'evaluate-kpi'}" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">arrow_forward</span></button></article>`).join(''):emptyState('done_all','Không có KPI cần xử lý','Các KPI chờ đánh giá hoặc chốt sẽ xuất hiện tại đây.')}</section></div></div>`;
}
function renderActionCardsV2(tasks,type){
  if(!tasks.length)return emptyState('done_all','Không có dữ liệu cần xử lý','Danh sách này hiện đang trống.');
  return tasks.slice(0,12).map(t=>`<article class="action-ticket ${type}"><div class="ticket-icon"><span class="material-symbols-rounded">${type==='danger'?'schedule':type==='warning'?'hourglass_top':'event_upcoming'}</span></div><div class="ticket-main"><strong>${escapeHtml(t['Tên công việc'])}</strong><p>${escapeHtml(employeeName(t['Mã người phụ trách']))} · ${escapeHtml(projectName(t['Mã dự án']))}</p><div class="ticket-meta"><span>Hạn ${formatDate(t['Hạn hoàn thành'])}</span>${statusBadge(type==='danger'?'Quá hạn':t['Trạng thái'])}</div></div><button class="row-action view" data-action="${t['Trạng thái']==='Chờ xác nhận'&&APP.permissions.canConfirmTask?'confirm-task':'view-task'}" data-id="${t['Mã công việc']}"><span class="material-symbols-rounded">arrow_forward</span></button></article>`).join('');
}

function renderCalendar(){
  ensurePatchState();
  const d=APP.state.calendarDate||new Date();
  const tasks=(APP.data.tasks||[]).filter(t=>t['Trạng thái']!=='Đã hủy');
  const title=APP.state.calendarView==='day'?formatDateLong(d):APP.state.calendarView==='week'?`Tuần ${formatDate(weekStart(d))} - ${formatDate(new Date(weekStart(d).getFullYear(),weekStart(d).getMonth(),weekStart(d).getDate()+6))}`:`Tháng ${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  const stats={all:tasks.length,over:tasks.filter(isTaskOverdue).length,wait:tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận').length,done:tasks.filter(t=>t['Trạng thái']==='Hoàn thành').length};
  document.getElementById('page-content').innerHTML=`<div class="page-shell calendar-page-v2">${pageHead('Lịch công việc','Lịch theo ngày, tuần, tháng; click vào thẻ công việc để mở hồ sơ.')}<div class="panel calendar-shell-v2"><div class="calendar-topbar-v2"><div class="calendar-nav-v2"><button class="row-action" data-action="calendar-prev"><span class="material-symbols-rounded">chevron_left</span></button><button class="btn btn-sm" data-action="calendar-today">Hôm nay</button><button class="row-action" data-action="calendar-next"><span class="material-symbols-rounded">chevron_right</span></button><h2>${escapeHtml(title)}</h2></div><div class="calendar-mode-tabs"><button class="${APP.state.calendarView==='day'?'active':''}" data-action="calendar-view" data-view="day">Ngày</button><button class="${APP.state.calendarView==='week'?'active':''}" data-action="calendar-view" data-view="week">Tuần</button><button class="${APP.state.calendarView==='month'?'active':''}" data-action="calendar-view" data-view="month">Tháng</button></div></div><div class="calendar-stats-row"><span><b>${stats.all}</b> việc</span><span class="danger"><b>${stats.over}</b> quá hạn</span><span class="warning"><b>${stats.wait}</b> chờ xác nhận</span><span class="success"><b>${stats.done}</b> hoàn thành</span></div>${APP.state.calendarView==='day'?renderCalendarDayV2(d,tasks):APP.state.calendarView==='week'?renderCalendarWeekV2(d,tasks):renderCalendarMonthV2(d,tasks)}</div></div>`;
}
function weekStart(date){const d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-d.getDay());return d;}
function formatDateLong(d){return `${['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][d.getDay()]}, ${formatDate(d)}`;}
function calendarTaskPill(t){const cls=t['Trạng thái']==='Hoàn thành'?'done':isTaskOverdue(t)?'overdue':t['Trạng thái']==='Chờ xác nhận'?'waiting':'active';return `<button class="cal-task ${cls}" data-action="view-task" data-id="${t['Mã công việc']}" title="${escapeAttr(t['Tên công việc'])}"><strong>${escapeHtml(t['Tên công việc'])}</strong><small>${escapeHtml(employeeName(t['Mã người phụ trách']))}</small></button>`;}
function renderCalendarMonthV2(d,tasks){const y=d.getFullYear(),m=d.getMonth(),start=weekStart(new Date(y,m,1));const days=Array.from({length:42},(_,i)=>new Date(start.getFullYear(),start.getMonth(),start.getDate()+i));return `<div class="calendar-week-head-v2">${['CN','T2','T3','T4','T5','T6','T7'].map(x=>`<div>${x}</div>`).join('')}</div><div class="calendar-month-grid-v2">${days.map(day=>{const dayTasks=tasks.filter(t=>sameDay(parseDate(t['Hạn hoàn thành']),day));return `<div class="calendar-cell-v2 ${day.getMonth()!==m?'muted-cell':''} ${sameDay(day,new Date())?'today':''}"><div class="cell-date">${day.getDate()}</div><div class="cell-tasks">${dayTasks.slice(0,4).map(calendarTaskPill).join('')}${dayTasks.length>4?`<button class="cal-more">+${dayTasks.length-4} việc</button>`:''}</div></div>`}).join('')}</div>`;}
function renderCalendarWeekV2(d,tasks){const start=weekStart(d);const days=Array.from({length:7},(_,i)=>new Date(start.getFullYear(),start.getMonth(),start.getDate()+i));return `<div class="calendar-week-board-v2">${days.map(day=>{const dayTasks=tasks.filter(t=>sameDay(parseDate(t['Hạn hoàn thành']),day));return `<section class="week-day-col ${sameDay(day,new Date())?'today':''}"><header><strong>${['CN','T2','T3','T4','T5','T6','T7'][day.getDay()]}</strong><span>${day.getDate()}</span></header><div class="week-day-list">${dayTasks.length?dayTasks.map(calendarTaskPill).join(''): '<div class="cal-empty">Không có việc</div>'}</div></section>`}).join('')}</div>`;}
function renderCalendarDayV2(d,tasks){const dayTasks=tasks.filter(t=>sameDay(parseDate(t['Hạn hoàn thành']),d)).sort((a,b)=>String(a['Mức độ ưu tiên']).localeCompare(String(b['Mức độ ưu tiên']),'vi'));return `<div class="calendar-day-board-v2"><aside class="day-summary"><h3>${formatDateLong(d)}</h3><p>${dayTasks.length} công việc đến hạn trong ngày.</p>${reportMetric('Quá hạn',dayTasks.filter(isTaskOverdue).length,'schedule','red')}${reportMetric('Chờ xác nhận',dayTasks.filter(t=>t['Trạng thái']==='Chờ xác nhận').length,'hourglass_top','orange')}</aside><section class="day-timeline">${dayTasks.length?dayTasks.map(t=>`<article class="day-task-card ${isTaskOverdue(t)?'overdue':''}"><div><strong>${escapeHtml(t['Tên công việc'])}</strong><p>${escapeHtml(projectName(t['Mã dự án']))} · ${escapeHtml(employeeName(t['Mã người phụ trách']))}</p></div><div>${statusBadge(isTaskOverdue(t)?'Quá hạn':t['Trạng thái'])}${statusBadge(t['Mức độ ưu tiên'])}</div><button class="btn btn-sm" data-action="view-task" data-id="${t['Mã công việc']}">Mở hồ sơ</button></article>`).join(''):emptyState('event_available','Không có công việc trong ngày','Chọn ngày khác hoặc chuyển sang dạng xem tháng.')}</section></div>`;}
function changeCalendarMonth(delta){ensurePatchState();const d=APP.state.calendarDate||new Date();if(APP.state.calendarView==='day')APP.state.calendarDate=new Date(d.getFullYear(),d.getMonth(),d.getDate()+delta);else if(APP.state.calendarView==='week')APP.state.calendarDate=new Date(d.getFullYear(),d.getMonth(),d.getDate()+delta*7);else APP.state.calendarDate=new Date(d.getFullYear(),d.getMonth()+delta,1);renderCurrentPage();}
function goCalendarToday(){APP.state.calendarDate=new Date();renderCurrentPage();}

function renderNotificationPopover(){
  const tasks=APP.data.tasks||[];const overdue=tasks.filter(isTaskOverdue);const waiting=tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận');const near=tasks.filter(isTaskNearDue);const total=overdue.length+waiting.length+near.length;
  const items=[...overdue.slice(0,5).map(t=>({type:'red',icon:'schedule',title:'Quá hạn',text:t['Tên công việc'],sub:`Hạn ${formatDate(t['Hạn hoàn thành'])} · ${employeeName(t['Mã người phụ trách'])}`,action:'view-task',id:t['Mã công việc']})),...waiting.slice(0,4).map(t=>({type:'orange',icon:'hourglass_top',title:'Chờ xác nhận',text:t['Tên công việc'],sub:`${employeeName(t['Mã người phụ trách'])} đã gửi kiểm tra`,action:APP.permissions.canConfirmTask?'confirm-task':'view-task',id:t['Mã công việc']})),...near.slice(0,4).map(t=>({type:'blue',icon:'event_upcoming',title:'Sắp đến hạn',text:t['Tên công việc'],sub:`Hạn ${formatDate(t['Hạn hoàn thành'])}`,action:'view-task',id:t['Mã công việc']}))].slice(0,10);
  const body=items.length?items.map(it=>`<button class="notification-item-v2 ${it.type}" data-action="${it.action}" data-id="${escapeAttr(it.id)}"><span class="notification-type"><span class="material-symbols-rounded">${it.icon}</span></span><span class="notification-copy"><b>${escapeHtml(it.title)}</b><strong>${escapeHtml(it.text)}</strong><small>${escapeHtml(it.sub)}</small></span><span class="material-symbols-rounded arrow">chevron_right</span></button>`).join(''):emptyState('notifications_none','Không có thông báo','Các việc quá hạn, sắp đến hạn hoặc chờ xác nhận sẽ hiển thị tại đây.');
  return `<div class="notification-popover-v2"><div class="notification-popover-head-v2"><div><strong>Thông báo công việc</strong><small>Tập trung việc cần chú ý trong kỳ đang xem</small></div><span class="notification-total">${total}</span></div><div class="notification-mini-stats"><span class="red">${overdue.length} quá hạn</span><span class="orange">${waiting.length} chờ xác nhận</span><span class="blue">${near.length} sắp đến hạn</span></div><div class="notification-list-v2">${body}</div><div class="notification-popover-foot-v2"><button class="btn btn-sm" data-action="refresh-data"><span class="material-symbols-rounded">refresh</span>Làm mới</button><button class="btn btn-primary btn-sm" data-page="action-center"><span class="material-symbols-rounded">open_in_new</span>Xem tất cả</button></div></div>`;
}

async function saveSimpleRecord(module,data,processing,success){
  closeModal();
  const t=showToast(processing,'Popup đã đóng. Hệ thống đang lưu dữ liệu ở nền.','processing',0);
  try{const res=await gas('saveRecord',module,data,APP.token,{timeout:60000});mergeDataResult(res);updateToast(t,success,'Giao diện đã được cập nhật mà không tải lại toàn bộ web app.','success',3500);renderCurrentPage();}
  catch(err){updateToast(t,'Không thể lưu dữ liệu',err.message,'error',6500);}
}
async function saveProjectModal(){
  const data=collectForm();const memberIds=getCheckedPeople('project-members');APP.state.pendingFiles=APP.state.pendingFiles||[];closeModal();
  const toast=showToast('Đang lưu dự án','Popup đã đóng. Dữ liệu dự án đang được đồng bộ ở nền.','processing',0);
  try{const res=await gas('saveRecord','projects',data,APP.token,{timeout:60000});mergeDataResult(res);const id=res.id||data['Mã dự án'];if(id){const members=memberIds.filter(x=>x!==data['Mã người phụ trách']).map(employeeId=>({employeeId,role:'Thành viên',joinDate:data['Ngày bắt đầu'],status:data['Trạng thái']==='Hoàn thành'?'Đã kết thúc':'Đang tham gia'}));const r2=await gas('saveProjectMembers',id,members,APP.token,{timeout:60000});mergeDataResult(r2);}if(id&&APP.state.pendingFiles.length)await uploadPendingFiles('Dự án',id);updateToast(toast,'Đã lưu dự án','Dữ liệu và thành viên dự án đã được cập nhật.','success',3500);renderCurrentPage();}catch(err){updateToast(toast,'Không thể lưu dự án',err.message,'error',6500);}
}
async function saveTaskWizard(){
  const w=APP.state.wizard;
  if(!w)return;
  syncWizardParticipants();
  if(validateWizardRows()){
    w.step=1;
    renderTaskWizard();
    showToast('Chưa thể lưu','Vui lòng sửa các dòng lỗi trước khi lưu.','error');
    return;
  }

  const fileRows=w.rows.map(r=>r.__files||[]);
  const mode=w.mode;
  closeModal();

  const toast=showToast('Đang lưu công việc','Bản ghi chính sẽ hiển thị ngay sau khi Google Sheet xác nhận lưu.','processing',0);
  let primarySaved=false;
  let savedIds=[];

  try{
    if(mode==='edit'){
      const r=w.rows[0];
      const clean=stripWizardRow(r);
      const res=await gas('saveRecord','tasks',clean,APP.token,{timeout:45000});
      mergeDataResult(res);
      const id=res.id||clean['Mã công việc'];
      savedIds=[id];
      primarySaved=true;

      // Hiện ngay bản ghi chính, không chờ người tham gia/file.
      renderCurrentPage();

      if(APP.permissions.canManageTasks){
        const pr=await gas('saveTaskParticipants',id,r.__participants.map(employeeId=>({
          employeeId,role:'Phối hợp',joinDate:r['Ngày bắt đầu'],
          status:r['Trạng thái']==='Hoàn thành'?'Đã kết thúc':'Đang tham gia'
        })),APP.token,{timeout:45000});
        mergeDataResult(pr);
      }
      for(const f of (fileRows[0]||[])) await uploadOneFile(f,'Công việc',id);
    }else{
      const hasFiles=fileRows.some(x=>x.length);
      if(!hasFiles){
        const res=await gas('bulkAddRecords','tasks',w.rows.map(stripWizardRow),APP.token,{timeout:60000});
        if(res.success===false)throw new Error(res.errors?.map(x=>`Dòng ${x.row}: ${x.errors.join(', ')}`).join('; ')||'Có dòng dữ liệu không hợp lệ.');
        mergeDataResult(res);
        savedIds=res.ids||[];
        primarySaved=true;

        // Hiện toàn bộ công việc mới ngay sau batch insert.
        renderCurrentPage();

        for(let i=0;i<savedIds.length;i++){
          if(w.rows[i].__participants.length){
            const pr=await gas('saveTaskParticipants',savedIds[i],w.rows[i].__participants.map(employeeId=>({
              employeeId,role:'Phối hợp',joinDate:w.rows[i]['Ngày bắt đầu'],status:'Đang tham gia'
            })),APP.token,{timeout:45000});
            mergeDataResult(pr);
          }
        }
      }else{
        for(let i=0;i<w.rows.length;i++){
          const r=w.rows[i];
          const res=await gas('saveRecord','tasks',stripWizardRow(r),APP.token,{timeout:45000});
          mergeDataResult(res);
          const id=res.id;
          savedIds.push(id);
          primarySaved=true;

          // Mỗi dòng hiện ngay khi lưu xong, tránh cảm giác đứng/không tạo được.
          renderCurrentPage();

          if(r.__participants.length){
            const pr=await gas('saveTaskParticipants',id,r.__participants.map(employeeId=>({
              employeeId,role:'Phối hợp',joinDate:r['Ngày bắt đầu'],status:'Đang tham gia'
            })),APP.token,{timeout:45000});
            mergeDataResult(pr);
          }
          for(const f of (fileRows[i]||[])) await uploadOneFile(f,'Công việc',id);
        }
      }
    }

    renderCurrentPage();
    updateToast(toast,'Đã lưu công việc',`${savedIds.length||1} công việc đã được cập nhật trên giao diện. Người tham gia và file đính kèm đã đồng bộ xong.`,'success',4000);
  }catch(err){
    // Nếu bản ghi chính đã lưu, không báo "không thể lưu công việc" vì sẽ khiến người dùng tạo trùng.
    if(primarySaved){
      renderCurrentPage();
      updateToast(toast,'Công việc đã được lưu',`Bản ghi chính đã có trên hệ thống, nhưng một phần dữ liệu phụ chưa đồng bộ xong: ${err.message}`,'warning',7000);
    }else{
      updateToast(toast,'Không thể lưu công việc',err.message,'error',6500);
    }
  }
}

function infoKV(label,value){return `<div class="info-kv"><small>${escapeHtml(label)}</small><strong>${value||'-'}</strong></div>`;}
function richModal(title,subtitle,type,id,tabs,tab,content,footer){return `<div class="modal xwide profile-modal-v2"><div class="modal-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle||'')}</p></div><button class="modal-close" data-action="close-modal"><span class="material-symbols-rounded">close</span></button></div>${tabs?profileTabs(type,id,tab,tabs):''}<div class="modal-body profile-v2">${content}</div><div class="modal-footer">${footer||'<button class="btn" data-action="close-modal">Đóng</button>'}</div></div>`;}
function renderProjectProfile(id,tab){const p=(APP.data.projects||[]).find(x=>x['Mã dự án']===id);if(!p)return;const tasks=(APP.data.tasks||[]).filter(t=>t['Mã dự án']===id),members=(APP.data.projectMembers||[]).filter(m=>m['Mã dự án']===id),files=filesFor('Dự án',id);let content='';if(tab==='tasks')content=renderTasksTable(tasks,'profileTasks',false);else if(tab==='members')content=`<div class="profile-card-grid">${members.map(m=>`<div class="profile-person-card">${personInline(m['Mã nhân sự'])}<div>${statusBadge(m['Vai trò tham gia'])} ${statusBadge(m['Trạng thái'])}</div><small>Tham gia từ ${formatDate(m['Ngày tham gia'])||'-'}</small></div>`).join('')||emptyState('group','Chưa có thành viên','Thành viên dự án sẽ hiển thị tại đây.')}</div>`;else if(tab==='files')content=files.length?`<div class="file-list">${files.map(fileCard).join('')}</div>`:emptyState('folder_copy','Chưa có tài liệu','Tài liệu dự án sẽ hiển thị ở đây.');else content=`<div class="profile-hero-v2 project"><div class="hero-icon"><span class="material-symbols-rounded">folder_open</span></div><div><h2>${escapeHtml(p['Tên dự án'])}</h2><p>${escapeHtml(p['Mã dự án'])} · ${escapeHtml(p['Loại dự án'])} · Phụ trách: ${escapeHtml(employeeName(p['Mã người phụ trách']))}</p><div class="hero-badges">${statusBadge(p['Trạng thái'])}${statusBadge(p['Mức độ ưu tiên'])}</div></div><div class="hero-score"><strong>${round1(p['Tiến độ (%)']||0)}%</strong><small>Tiến độ</small></div></div><div class="profile-stats-v2">${reportMetric('Công việc',tasks.length,'checklist','blue')}${reportMetric('Hoàn thành',tasks.filter(t=>t['Trạng thái']==='Hoàn thành').length,'verified','green')}${reportMetric('Quá hạn',tasks.filter(isTaskOverdue).length,'schedule','red')}${reportMetric('Thành viên',members.length,'groups','violet')}</div><div class="profile-info-grid"><section class="profile-info-panel"><h3>Thông tin chính</h3>${infoKV('Ngày bắt đầu',formatDate(p['Ngày bắt đầu']))}${infoKV('Kết thúc dự kiến',formatDate(p['Ngày dự kiến kết thúc']))}${infoKV('Ngày hoàn thành thực tế',formatDate(p['Ngày hoàn thành thực tế'])||'-')}${infoKV('Người tạo',escapeHtml(employeeName(p['Người tạo'])||p['Người tạo']||'-'))}</section><section class="profile-info-panel wide"><h3>Mô tả & ghi chú</h3><div class="project-rich-description">${safeRichHtml(p['Mô tả']||'Chưa có mô tả.')}</div><div class="project-rich-description">${safeRichHtml(p['Ghi chú']||'Không có ghi chú.')}</div></section></div><div class="profile-section"><h3>Công việc gần nhất</h3>${renderTasksTable(tasks.slice(0,5),'profileRecentTasks',false)}</div>`;openModal(richModal('Hồ sơ dự án','Tổng quan tiến độ, thành viên, công việc và tài liệu liên quan.','project',id,[['overview','Tổng quan'],['tasks','Công việc'],['members','Thành viên'],['files','Tài liệu']],tab,content,`${APP.permissions.canManageProjects?`<button class="btn btn-primary" data-action="edit-project" data-id="${id}"><span class="material-symbols-rounded">edit</span>Chỉnh sửa</button>`:''}<button class="btn" data-action="close-modal">Đóng</button>`));}
function renderTaskProfile(id,tab){const t=(APP.data.tasks||[]).find(x=>x['Mã công việc']===id);if(!t)return;const participants=(APP.data.taskParticipants||[]).filter(p=>p['Mã công việc']===id),files=filesFor('Công việc',id);let content='';if(tab==='people')content=`<div class="profile-info-grid"><section class="profile-info-panel"><h3>Người phụ trách chính</h3>${personInline(t['Mã người phụ trách'])}</section><section class="profile-info-panel wide"><h3>Người tham gia</h3>${participants.length?participants.map(p=>`<div class="profile-person-line">${personInline(p['Mã nhân sự'])}<span>${statusBadge(p['Vai trò tham gia'])}${statusBadge(p['Trạng thái'])}</span></div>`).join(''):emptyState('group','Chưa có người tham gia','Công việc hiện chỉ có người phụ trách chính.')}</section></div>`;else if(tab==='files')content=`<div class="section-title-row" style="margin-bottom:12px"><div><h3 style="margin:0">Tệp đính kèm công việc</h3><small>File tải lên tại đây sẽ được liên kết trực tiếp với công việc ${escapeHtml(id)}.</small></div>${(canEditTask(t)||APP.permissions.canManageProjects)?`<button class="btn btn-primary" data-action="upload-task-file" data-id="${escapeAttr(id)}"><span class="material-symbols-rounded">attach_file</span>Đính kèm tệp</button>`:''}</div>${files.length?`<div class="file-list">${files.map(fileCard).join('')}</div>`:emptyState('attach_file','Chưa có tài liệu','Bấm “Đính kèm tệp” để tải file trực tiếp vào công việc này.')}`;else content=`<div class="profile-hero-v2 task"><div class="hero-icon"><span class="material-symbols-rounded">task_alt</span></div><div><h2>${escapeHtml(t['Tên công việc'])}</h2><p>${escapeHtml(t['Mã công việc'])} · ${escapeHtml(projectName(t['Mã dự án']))} · ${escapeHtml(employeeName(t['Mã người phụ trách']))}</p><div class="hero-badges">${statusBadge(isTaskOverdue(t)?'Quá hạn':t['Trạng thái'])}${statusBadge(t['Mức độ ưu tiên'])}</div></div><div class="hero-score"><strong>${round1(t['Tiến độ (%)']||0)}%</strong><small>Tiến độ</small></div></div><div class="profile-stats-v2">${reportMetric('Người tham gia',participants.length+1,'groups','blue')}${reportMetric('File đính kèm',files.length,'attach_file','violet')}${reportMetric('Hạn hoàn thành',formatDate(t['Hạn hoàn thành']),'event','orange')}${reportMetric('Ngày xác nhận',formatDate(t['Ngày xác nhận'])||'-','verified','green')}</div><div class="profile-info-grid"><section class="profile-info-panel"><h3>Luồng xử lý</h3>${infoKV('Ngày bắt đầu',formatDate(t['Ngày bắt đầu']))}${infoKV('Người giao việc',escapeHtml(employeeName(t['Mã người giao việc'])||t['Mã người giao việc']))}${infoKV('Quản lý xác nhận',escapeHtml(employeeName(t['Mã quản lý xác nhận'])||'-'))}</section><section class="profile-info-panel wide"><h3>Yêu cầu và kết quả</h3><div class="task-rich-content"><b>Mô tả:</b>${safeRichHtml(t['Mô tả']||'Chưa có mô tả.')}</div><div class="task-rich-content"><b>Kết quả:</b>${safeRichHtml(t['Kết quả']||'Chưa cập nhật kết quả.')}</div><div class="task-rich-content"><b>Ghi chú:</b>${safeRichHtml(t['Ghi chú']||'Không có ghi chú.')}</div></section></div>`;openModal(richModal('Hồ sơ công việc','Thông tin, người tham gia, tài liệu và trạng thái xác nhận.','task',id,[['overview','Tổng quan'],['people','Người tham gia'],['files','Tài liệu']],tab,content,`<button class="btn" data-action="task-status" data-id="${id}"><span class="material-symbols-rounded">sync_alt</span>Cập nhật trạng thái</button>${canEditTask(t)?`<button class="btn btn-primary" data-action="edit-task" data-id="${id}"><span class="material-symbols-rounded">edit</span>Chỉnh sửa</button>`:''}<button class="btn" data-action="close-modal">Đóng</button>`));}
function renderEmployeeProfile(id,tab){const e=(APP.data.employees||[]).find(x=>x['Mã nhân sự']===id);if(!e)return;const tasks=(APP.data.tasks||[]).filter(t=>t['Mã người phụ trách']===id),projects=(APP.data.projects||[]).filter(p=>p['Mã người phụ trách']===id||(APP.data.projectMembers||[]).some(m=>m['Mã dự án']===p['Mã dự án']&&m['Mã nhân sự']===id)),kpis=(APP.data.kpiMonths||[]).filter(k=>k['Mã nhân sự']===id);let content='';if(tab==='tasks')content=renderTasksTable(tasks,'empTasks',false);else if(tab==='projects')content=renderProjectsTable(projects,'empProjects',false);else if(tab==='kpi')content=renderKpiCards(kpis);else content=`<div class="profile-hero-v2 employee">${avatarHtml(id,64)}<div><h2>${escapeHtml(e['Họ và tên'])}</h2><p>${escapeHtml(e['Mã nhân sự'])} · ${escapeHtml(e['Chức vụ'])} · ${escapeHtml(e['Nhóm'])}</p><div class="hero-badges">${statusBadge(e['Trạng thái'])}</div></div><div class="hero-score"><strong>${kpis.length?round1([...kpis].sort((a,b)=>parseDate(b['Kỳ'])-parseDate(a['Kỳ']))[0]['Tổng điểm KPI']):'-'}</strong><small>KPI gần nhất</small></div></div><div class="profile-stats-v2">${reportMetric('Công việc',tasks.length,'checklist','blue')}${reportMetric('Hoàn thành',tasks.filter(t=>t['Trạng thái']==='Hoàn thành').length,'verified','green')}${reportMetric('Dự án tham gia',projects.length,'folder_open','violet')}${reportMetric('KPI hồ sơ',kpis.length,'speed','orange')}</div><div class="profile-info-grid"><section class="profile-info-panel"><h3>Thông tin liên hệ</h3>${infoKV('Email',escapeHtml(e['Email']||'-'))}${infoKV('Số điện thoại',escapeHtml(formatPhone(e['Số điện thoại'])||'-'))}${infoKV('Ngày tháng năm sinh',formatDate(e['Ngày tháng năm sinh']))}</section><section class="profile-info-panel"><h3>Tổ chức</h3>${infoKV('Nhóm',escapeHtml(e['Nhóm']||'-'))}${infoKV('Chức vụ',escapeHtml(e['Chức vụ']||'-'))}${infoKV('Quản lý trực tiếp',escapeHtml(employeeName(e['Mã quản lý trực tiếp'])||'-'))}</section><section class="profile-info-panel wide"><h3>Ghi chú</h3><div class="project-rich-description employee-note-rich" style="white-space:normal;overflow-wrap:anywhere;line-height:1.7">${safeRichHtml(e['Ghi chú']||'Không có ghi chú.')}</div></section></div>`;openModal(richModal('Hồ sơ nhân sự','Tổng hợp công việc, dự án và KPI.','employee',id,[['overview','Tổng quan'],['tasks','Công việc'],['projects','Dự án'],['kpi','KPI']],tab,content,`${APP.permissions.canManageEmployees?`<button class="btn btn-primary" data-action="edit-employee" data-id="${id}"><span class="material-symbols-rounded">edit</span>Chỉnh sửa</button>`:''}<button class="btn" data-action="close-modal">Đóng</button>`));}
function openKpiProfile(id){const k=(APP.data.kpiMonths||[]).find(x=>x['Mã KPI tháng']===id);if(!k)return;const details=kpiDetails(id);const body=`<div class="profile-hero-v2 kpi">${avatarHtml(k['Mã nhân sự'],64)}<div><h2>${escapeHtml(employeeName(k['Mã nhân sự']))}</h2><p>Kỳ ${formatPeriod(k['Kỳ'])} · Quản lý: ${escapeHtml(employeeName(k['Mã quản lý đánh giá']))}</p><div class="hero-badges">${statusBadge(k['Trạng thái KPI'])}${statusBadge(k['Xếp loại']||'Chưa xếp loại')}</div></div><div class="hero-score"><strong>${round1(k['Tổng điểm KPI']||0)}</strong><small>/120 điểm</small></div></div><div class="profile-stats-v2">${reportMetric('Chỉ tiêu',details.length,'list_alt','blue')}${reportMetric('Tự động',details.filter(d=>d['Nguồn số liệu']==='Tự động hệ thống').length,'auto_awesome','green')}${reportMetric('Nhóm tự nhập',details.filter(d=>d['Nguồn số liệu']==='Nhóm tự nhập').length,'edit_note','orange')}${reportMetric('Ngày chốt',formatDate(k['Ngày chốt'])||'-','lock','violet')}</div><div class="data-table-wrap" style="margin-top:12px"><table class="data-table data-table-v2"><thead><tr><th>Chỉ tiêu</th><th>Mục tiêu</th><th>Thực tế</th><th>Điểm</th><th>Trọng số</th><th>Quy đổi</th><th>Nguồn</th><th>Nhận xét</th></tr></thead><tbody>${details.map(d=>`<tr><td class="main-cell"><strong>${escapeHtml(d['Tên chỉ tiêu'])}</strong><small>${escapeHtml(d['Nhóm KPI'])}</small></td><td>${round1(d['Mục tiêu'])} ${escapeHtml(d['Đơn vị tính'])}</td><td>${round1(d['Thực tế'])}</td><td>${round1(d['Điểm chỉ tiêu'])}/120</td><td>${round1(d['Trọng số (%)'])}%</td><td><strong>${round1(d['Điểm quy đổi'])}</strong></td><td>${escapeHtml(d['Nguồn số liệu'])}</td><td>${escapeHtml(d['Nhận xét quản lý']||'-')}</td></tr>`).join('')}</tbody></table></div><div class="profile-info-panel wide" style="margin-top:12px"><h3>Nhận xét tổng hợp</h3><p>${escapeHtml(k['Nhận xét tổng hợp']||'Chưa có nhận xét.')}</p></div>`;openModal(modalShell('Hồ sơ KPI',`${escapeHtml(k['Mã KPI tháng'])} · Điểm tối đa 120`,body,`${APP.permissions.canEvaluateKpi&&k['Trạng thái KPI']!=='Đã chốt'?`<button class="btn btn-primary" data-action="evaluate-kpi" data-id="${id}">Đánh giá</button>`:''}<button class="btn" data-action="close-modal">Đóng</button>`,'xwide'));}
function openKpiTemplateProfile(id){const t=(APP.data.kpiTemplates||[]).find(x=>x['Mã mẫu KPI']===id);if(!t)return;const details=(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===id);const weight=details.reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0);openModal(modalShell('Chi tiết mẫu KPI',t['Tên mẫu KPI'],`<div class="profile-hero-v2 template"><div class="hero-icon"><span class="material-symbols-rounded">description</span></div><div><h2>${escapeHtml(t['Tên mẫu KPI'])}</h2><p>${escapeHtml(t['Phạm vi áp dụng'])}: ${escapeHtml(t['Giá trị áp dụng'])} · Hiệu lực ${formatDate(t['Ngày hiệu lực'])}</p><div class="hero-badges">${statusBadge(t['Trạng thái'])}</div></div><div class="hero-score"><strong>${round1(weight)}%</strong><small>Tổng trọng số</small></div></div><div class="profile-stats-v2">${reportMetric('Số chỉ tiêu',details.length,'list_alt','blue')}${reportMetric('Tự động',details.filter(d=>d['Cách ghi nhận']==='Tự động hệ thống').length,'auto_awesome','green')}${reportMetric('Nhóm tự nhập',details.filter(d=>d['Cách ghi nhận']==='Nhóm tự nhập').length,'edit_note','orange')}${reportMetric('Điểm tối đa','120','target','violet')}</div><div class="data-table-wrap" style="margin-top:12px"><table class="data-table data-table-v2"><thead><tr><th>Chỉ tiêu</th><th>Nhóm</th><th>Mục tiêu</th><th>Trọng số</th><th>Ghi nhận</th><th>Chiều đánh giá</th><th>Điểm tối đa</th><th>Ghi chú</th></tr></thead><tbody>${details.map(d=>`<tr><td><strong>${escapeHtml(d['Tên chỉ tiêu'])}</strong></td><td>${escapeHtml(d['Nhóm KPI'])}</td><td>${round1(d['Mục tiêu mặc định'])} ${escapeHtml(d['Đơn vị tính'])}</td><td>${round1(d['Trọng số (%)'])}%</td><td>${escapeHtml(d['Cách ghi nhận'])}</td><td>${escapeHtml(d['Chiều đánh giá']||'Càng cao càng tốt')}</td><td>${round1(d['Điểm tối đa'])}</td><td>${escapeHtml(d['Ghi chú']||'-')}</td></tr>`).join('')}</tbody></table></div>`,`<button class="btn btn-primary" data-action="edit-template" data-id="${id}">Chỉnh sửa</button><button class="btn" data-action="close-modal">Đóng</button>`,'xwide'));}


/* Fix CRUD nhanh: hiển thị dự án ngay sau khi bản ghi chính lưu thành công. */
async function saveProjectModal(){
  const data=collectForm();
  const memberIds=getCheckedPeople('project-members');
  const pendingFiles=[...(APP.state.pendingFiles||[])];
  closeModal();

  const toast=showToast('Đang lưu dự án','Bản ghi dự án sẽ hiển thị ngay sau khi Google Sheet xác nhận lưu.','processing',0);
  let primarySaved=false;

  try{
    const res=await gas('saveRecord','projects',data,APP.token,{timeout:45000});
    mergeDataResult(res);
    const id=res.id||data['Mã dự án'];
    primarySaved=true;

    // Render ngay bản ghi chính, không chờ thành viên/file.
    renderCurrentPage();

    if(id){
      const members=memberIds.filter(x=>x!==data['Mã người phụ trách']).map(employeeId=>({
        employeeId,role:'Thành viên',joinDate:data['Ngày bắt đầu'],
        status:data['Trạng thái']==='Hoàn thành'?'Đã kết thúc':'Đang tham gia'
      }));
      const r2=await gas('saveProjectMembers',id,members,APP.token,{timeout:45000});
      mergeDataResult(r2);
    }

    if(id&&pendingFiles.length){
      APP.state.pendingFiles=pendingFiles;
      await uploadPendingFiles('Dự án',id);
      APP.state.pendingFiles=[];
    }

    renderCurrentPage();
    updateToast(toast,'Đã lưu dự án','Dự án đã hiển thị và các dữ liệu liên quan đã đồng bộ.','success',3500);
  }catch(err){
    if(primarySaved){
      renderCurrentPage();
      updateToast(toast,'Dự án đã được lưu',`Bản ghi chính đã có trên hệ thống, nhưng một phần dữ liệu phụ chưa đồng bộ xong: ${err.message}`,'warning',7000);
    }else{
      updateToast(toast,'Không thể lưu dự án',err.message,'error',6500);
    }
  }
}


/* ===================== UX/UI FIX PATCH 3 - 2026-08-10 =====================
   Calendar mới + bộ lọc riêng theo module dạng inline, chọn nhiều và lọc ngay.
============================================================================ */

const SME_PATCH3_BASE_HANDLE_CLICK = handleClick;
const SME_PATCH3_BASE_HANDLE_CHANGE = handleChange;
const SME_PATCH3_BASE_ROUTE_ACTION = routeAction;
const SME_PATCH3_BASE_APPLY_GENERIC_FILTERS = applyGenericFilters;

function patch3EnsureState(){
  APP.state.calendarView = APP.state.calendarView || 'month';
  APP.state.filters = APP.state.filters || {};
  APP.state.dateFilters = APP.state.dateFilters || {};
}

function closeInlineFilterMenus(except){
  document.querySelectorAll('.inline-filter-menu').forEach(menu=>{
    if(except && menu===except) return;
    menu.classList.add('hidden');
  });
  document.querySelectorAll('.inline-filter.open').forEach(box=>{
    if(except && box.contains(except)) return;
    box.classList.remove('open');
  });
}

handleClick = async function(e){
  if(!e.target.closest('.inline-filter')) closeInlineFilterMenus();
  return SME_PATCH3_BASE_HANDLE_CLICK(e);
};

handleChange = function(e){
  const dateInput=e.target.closest('[data-filter-date]');
  if(dateInput){
    updateInlineDateFilter(dateInput.dataset.module,dateInput.dataset.field,dateInput.dataset.part,dateInput.value,dateInput.dataset.filterType||'date');
    return;
  }
  return SME_PATCH3_BASE_HANDLE_CHANGE(e);
};

routeAction = async function(action,el,e){
  patch3EnsureState();
  if(action==='calendar-view'){
    APP.state.calendarView=el.dataset.view||'month';
    renderCurrentPage();
    return;
  }
  if(action==='calendar-date'){
    const d=parseDateFromIso(el.dataset.date);
    if(d){APP.state.calendarDate=d;APP.state.calendarView='day';renderCurrentPage();}
    return;
  }
  if(action==='filter-menu-toggle'){
    const menu=el.closest('.inline-filter')?.querySelector('.inline-filter-menu');
    if(!menu) return;
    const isHidden=menu.classList.contains('hidden');
    closeInlineFilterMenus(menu);
    menu.classList.toggle('hidden',!isHidden);
    el.closest('.inline-filter')?.classList.toggle('open',isHidden);
    return;
  }
  if(action==='inline-filter-option'){
    toggleInlineFilterOption(el.dataset.module,el.dataset.field,decodeURIComponent(el.dataset.value||''));
    return;
  }
  if(action==='clear-one-filter-field'){
    clearOneFilterField(el.dataset.module,el.dataset.field);
    return;
  }
  if(action==='clear-module-filters'){
    clearAllInlineFilters(el.dataset.module);
    return;
  }
  return SME_PATCH3_BASE_ROUTE_ACTION(action,el,e);
};

function parseDateFromIso(s){
  const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?new Date(+m[1],+m[2]-1,+m[3]):null;
}
function toIsoDate(d){
  d=parseDate(d)||new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function firstDayOfWeek(d){return weekStart(d);} 
function endDayOfWeek(d){const s=firstDayOfWeek(d);return new Date(s.getFullYear(),s.getMonth(),s.getDate()+6);} 
function priorityOrder(v){return {'Khẩn':0,'Cao':1,'Bình thường':2,'Thấp':3}[v] ?? 9;}
function sortCalendarTasks(rows){return [...rows].sort((a,b)=>priorityOrder(a['Mức độ ưu tiên'])-priorityOrder(b['Mức độ ưu tiên']) || parseDate(a['Hạn hoàn thành'])-parseDate(b['Hạn hoàn thành']) || String(a['Tên công việc']).localeCompare(String(b['Tên công việc']),'vi'));}
function calendarTaskTone(t){return t['Trạng thái']==='Hoàn thành'?'done':isTaskOverdue(t)?'overdue':t['Trạng thái']==='Chờ xác nhận'?'waiting':t['Mức độ ưu tiên']==='Khẩn'?'urgent':'active';}
function taskDueDate(t){return parseDate(t['Hạn hoàn thành']);}

function calendarMetricCard(label,value,icon,tone,note){
  return `<article class="calendar-metric-card ${tone}"><div class="calendar-metric-icon"><span class="material-symbols-rounded">${icon}</span></div><div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong>${note?`<span>${escapeHtml(note)}</span>`:''}</div></article>`;
}
function calendarTaskMini(t){
  const tone=calendarTaskTone(t);
  return `<button class="calendar-task-mini ${tone}" data-action="view-task" data-id="${escapeAttr(t['Mã công việc'])}" title="${escapeAttr(t['Tên công việc'])}"><span></span><strong>${escapeHtml(t['Tên công việc'])}</strong><small>${escapeHtml(employeeName(t['Mã người phụ trách']))}</small></button>`;
}
function calendarTaskCard(t){
  const tone=calendarTaskTone(t);
  return `<article class="calendar-task-card ${tone}"><div class="task-card-status"><span class="material-symbols-rounded">${tone==='overdue'?'schedule':tone==='waiting'?'hourglass_top':tone==='done'?'verified':'task_alt'}</span></div><div class="task-card-main"><strong>${escapeHtml(t['Tên công việc'])}</strong><p>${escapeHtml(projectName(t['Mã dự án']))} · ${escapeHtml(employeeName(t['Mã người phụ trách']))}</p><div class="task-card-tags">${statusBadge(isTaskOverdue(t)?'Quá hạn':t['Trạng thái'])}${statusBadge(t['Mức độ ưu tiên'])}<span class="task-date-chip">${formatDate(t['Hạn hoàn thành'])}</span></div></div><button class="btn btn-sm" data-action="view-task" data-id="${escapeAttr(t['Mã công việc'])}">Mở hồ sơ</button></article>`;
}

renderCalendar = function(){
  patch3EnsureState();
  const d=APP.state.calendarDate||new Date();
  const base=(APP.data.tasks||[]).filter(t=>t['Trạng thái']!=='Đã hủy');
  const tasks=applyFeatureTaskFilters('calendar',base);
  const title=APP.state.calendarView==='day'?formatDateLong(d):APP.state.calendarView==='week'?`Tuần ${formatDate(firstDayOfWeek(d))} - ${formatDate(endDayOfWeek(d))}`:`Tháng ${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  const stats={all:tasks.length,over:tasks.filter(isTaskOverdue).length,wait:tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận').length,done:tasks.filter(t=>t['Trạng thái']==='Hoàn thành').length};
  const filters=featureFilterBar('calendar',[
    {key:'project',label:'Dự án',options:[{value:'',label:'Tất cả dự án'},...projectOptions()]},
    {key:'assignee',label:'Người phụ trách',options:[{value:'',label:'Tất cả nhân sự'},...personOptions()]},
    {key:'status',label:'Trạng thái',options:[{value:'',label:'Tất cả trạng thái'},...(APP.data.fixedOptions?.taskStatus||[]).map(v=>({value:v,label:v}))]},
    {key:'priority',label:'Ưu tiên',options:[{value:'',label:'Tất cả ưu tiên'},...(APP.data.fixedOptions?.priority||[]).map(v=>({value:v,label:v}))]}
  ],'Tìm công việc trên lịch...');
  document.getElementById('page-content').innerHTML=`<div class="page-shell calendar-pro-page">${pageHead('Lịch công việc','Theo dõi deadline theo ngày, tuần hoặc tháng với bộ lọc riêng cho lịch.')}<section class="panel calendar-pro-shell"><div class="calendar-pro-toolbar"><div class="calendar-pro-nav"><button class="row-action view" data-action="calendar-prev"><span class="material-symbols-rounded">chevron_left</span></button><button class="btn btn-sm calendar-today" data-action="calendar-today">Hôm nay</button><button class="row-action view" data-action="calendar-next"><span class="material-symbols-rounded">chevron_right</span></button><div><h2>${escapeHtml(title)}</h2><small>${APP.state.calendarView==='month'?'Tổng quan hạn công việc trong tháng':APP.state.calendarView==='week'?'Theo dõi công việc theo từng ngày trong tuần':'Danh sách công việc đến hạn trong ngày'}</small></div></div><div class="calendar-view-switch"><button class="${APP.state.calendarView==='day'?'active':''}" data-action="calendar-view" data-view="day">Ngày</button><button class="${APP.state.calendarView==='week'?'active':''}" data-action="calendar-view" data-view="week">Tuần</button><button class="${APP.state.calendarView==='month'?'active':''}" data-action="calendar-view" data-view="month">Tháng</button></div></div>${filters}<div class="calendar-metric-grid">${calendarMetricCard('Tổng công việc',stats.all,'checklist','blue','Theo bộ lọc')}${calendarMetricCard('Quá hạn',stats.over,'schedule','red','Cần ưu tiên')}${calendarMetricCard('Chờ xác nhận',stats.wait,'hourglass_top','orange','Quản lý kiểm tra')}${calendarMetricCard('Hoàn thành',stats.done,'verified','green','Đã xác nhận')}</div><div class="calendar-pro-body">${APP.state.calendarView==='day'?renderCalendarDayPro(d,tasks):APP.state.calendarView==='week'?renderCalendarWeekPro(d,tasks):renderCalendarMonthPro(d,tasks)}</div></section></div>`;
};


function renderCalendarMonthPro(d,tasks){
  const y=d.getFullYear(),m=d.getMonth();
  const start=weekStart(new Date(y,m,1));
  const days=Array.from({length:42},(_,i)=>new Date(start.getFullYear(),start.getMonth(),start.getDate()+i));
  const weekdays=['CN','T2','T3','T4','T5','T6','T7'];
  return `<div class="calendar-pro-month"><div class="calendar-pro-weekdays">${weekdays.map(w=>`<div>${w}</div>`).join('')}</div><div class="calendar-pro-grid">${days.map(day=>{const dayTasks=sortCalendarTasks(tasks.filter(t=>sameDay(taskDueDate(t),day)));const muted=day.getMonth()!==m;return `<div class="calendar-pro-cell ${muted?'is-muted':''} ${sameDay(day,new Date())?'is-today':''}"><button class="calendar-day-number" data-action="calendar-date" data-date="${toIsoDate(day)}">${day.getDate()}</button><div class="calendar-cell-events">${dayTasks.slice(0,3).map(calendarTaskMini).join('')}${dayTasks.length>3?`<button class="calendar-more-btn" data-action="calendar-date" data-date="${toIsoDate(day)}">+${dayTasks.length-3} việc khác</button>`:''}</div></div>`}).join('')}</div></div>`;
}
function renderCalendarWeekPro(d,tasks){
  const start=weekStart(d);const days=Array.from({length:7},(_,i)=>new Date(start.getFullYear(),start.getMonth(),start.getDate()+i));
  return `<div class="calendar-pro-week">${days.map(day=>{const dayTasks=sortCalendarTasks(tasks.filter(t=>sameDay(taskDueDate(t),day)));return `<section class="calendar-week-column ${sameDay(day,new Date())?'is-today':''}"><button class="calendar-week-head" data-action="calendar-date" data-date="${toIsoDate(day)}"><span>${['CN','T2','T3','T4','T5','T6','T7'][day.getDay()]}</span><strong>${day.getDate()}</strong><small>${String(day.getMonth()+1).padStart(2,'0')}/${day.getFullYear()}</small></button><div class="calendar-week-list">${dayTasks.length?dayTasks.map(calendarTaskMini).join(''):`<div class="calendar-empty-mini">Không có việc</div>`}</div></section>`}).join('')}</div>`;
}
function renderCalendarDayPro(d,tasks){
  const dayTasks=sortCalendarTasks(tasks.filter(t=>sameDay(taskDueDate(t),d)));
  const over=dayTasks.filter(isTaskOverdue).length, wait=dayTasks.filter(t=>t['Trạng thái']==='Chờ xác nhận').length, done=dayTasks.filter(t=>t['Trạng thái']==='Hoàn thành').length;
  return `<div class="calendar-pro-day"><aside class="calendar-day-side"><div class="day-date-card"><small>${['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][d.getDay()]}</small><strong>${String(d.getDate()).padStart(2,'0')}</strong><span>${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}</span></div><div class="day-side-stats"><div><b>${dayTasks.length}</b><span>Công việc</span></div><div class="danger"><b>${over}</b><span>Quá hạn</span></div><div class="warning"><b>${wait}</b><span>Chờ xác nhận</span></div><div class="success"><b>${done}</b><span>Hoàn thành</span></div></div></aside><section class="calendar-day-main"><div class="calendar-day-main-head"><div><h3>${formatDateLong(d)}</h3><p>${dayTasks.length?`${dayTasks.length} công việc cần theo dõi trong ngày.`:'Không có công việc đến hạn trong ngày này.'}</p></div><button class="btn btn-sm" data-action="calendar-view" data-view="month"><span class="material-symbols-rounded">calendar_month</span>Xem tháng</button></div><div class="calendar-day-list-pro">${dayTasks.length?dayTasks.map(calendarTaskCard).join(''):emptyState('event_available','Ngày này chưa có công việc','Chọn ngày khác trên lịch tháng hoặc tạo công việc mới.')}</div></section></div>`;
}
changeCalendarMonth = function(delta){
  patch3EnsureState();
  const d=APP.state.calendarDate||new Date();
  if(APP.state.calendarView==='day') APP.state.calendarDate=new Date(d.getFullYear(),d.getMonth(),d.getDate()+delta);
  else if(APP.state.calendarView==='week') APP.state.calendarDate=new Date(d.getFullYear(),d.getMonth(),d.getDate()+delta*7);
  else APP.state.calendarDate=new Date(d.getFullYear(),d.getMonth()+delta,1);
  renderCurrentPage();
};
goCalendarToday = function(){APP.state.calendarDate=new Date();renderCurrentPage();};

function normalizeFilterOption(opt){
  if(opt && typeof opt==='object') return {value:String(opt.value??''),label:String(opt.label??opt.value??'')};
  return {value:String(opt??''),label:String(labelForFilter('',opt??''))};
}
function employeeFilterOptions(){return (APP.data.employees||[]).map(e=>({value:e['Mã nhân sự'],label:e['Họ và tên']||e['Mã nhân sự']}));}
function projectFilterOptions(){return (APP.data.projects||[]).map(p=>({value:p['Mã dự án'],label:p['Tên dự án']||p['Mã dự án']}));}
function userFilterOptions(){return (APP.data.users||[]).map(u=>({value:u['Mã người dùng'],label:u['Tên đăng nhập']||u['Mã người dùng']}));}
function inlineFilterSpecsFor(module,originalSpecs){
  const fixed=APP.data.fixedOptions||{};
  const cats=APP.data.categories||{};
  const employees=employeeFilterOptions();
  const projects=projectFilterOptions();
  const base={
    projects:[{field:'Trạng thái',label:'Trạng thái',options:fixed.projectStatus||[]},{field:'Mã người phụ trách',label:'Người phụ trách',options:employees},{field:'Loại dự án',label:'Loại dự án',options:cats['Loại dự án']||[]},{field:'Mức độ ưu tiên',label:'Ưu tiên',options:fixed.priority||[]},{field:'Ngày bắt đầu',label:'Khoảng ngày',type:'date'}],
    tasks:[{field:'Trạng thái',label:'Trạng thái',options:fixed.taskStatus||[]},{field:'Tình trạng hạn',label:'Tình trạng hạn',options:['Quá hạn','Sắp đến hạn','Bình thường']},{field:'Mã người phụ trách',label:'Người phụ trách',options:employees},{field:'Mã dự án',label:'Dự án',options:projects},{field:'Mức độ ưu tiên',label:'Ưu tiên',options:fixed.priority||[]},{field:'Nhóm công việc',label:'Loại công việc',options:cats['Nhóm công việc']||[]},{field:'Hạn hoàn thành',label:'Khoảng ngày',type:'date'}],
    employees:[{field:'Nhóm',label:'Nhóm',options:cats['Nhóm']||[]},{field:'Chức vụ',label:'Chức vụ',options:cats['Chức vụ']||[]},{field:'Trạng thái',label:'Trạng thái',options:['Đang làm','Tạm nghỉ','Đã nghỉ']},{field:'Mã quản lý trực tiếp',label:'Quản lý',options:employees},{field:'Ngày tháng năm sinh',label:'Khoảng ngày',type:'date'}],
    kpiMonths:[{field:'Trạng thái KPI',label:'Trạng thái',options:fixed.kpiStatus||[]},{field:'Mã nhân sự',label:'Nhân sự',options:employees},{field:'Xếp loại',label:'Xếp loại',options:['Vượt mục tiêu','Tốt','Đạt','Cần cải thiện','Chưa đạt']},{field:'Kỳ',label:'Kỳ',type:'month'}],
    kpiEvaluation:[{field:'Trạng thái KPI',label:'Trạng thái',options:fixed.kpiStatus||[]},{field:'Mã nhân sự',label:'Nhân sự',options:employees},{field:'Kỳ',label:'Kỳ',type:'month'}],
    kpiFinalize:[{field:'Mã nhân sự',label:'Nhân sự',options:employees},{field:'Xếp loại',label:'Xếp loại',options:['Vượt mục tiêu','Tốt','Đạt','Cần cải thiện','Chưa đạt']},{field:'Kỳ',label:'Kỳ',type:'month'}],
    kpiTemplates:[{field:'Trạng thái',label:'Trạng thái',options:['Đang áp dụng','Ngừng áp dụng']},{field:'Phạm vi áp dụng',label:'Phạm vi',options:['Nhóm','Chức vụ','Nhân sự']},{field:'Giá trị áp dụng',label:'Giá trị áp dụng',options:unique((APP.data.kpiTemplates||[]).map(x=>x['Giá trị áp dụng']).filter(Boolean))},{field:'Ngày hiệu lực',label:'Khoảng ngày',type:'date'}],
    files:[{field:'Module liên quan',label:'Nguồn',options:['Dự án','Công việc','KPI tháng']},{field:'Loại tài liệu',label:'Loại tài liệu',options:cats['Loại tài liệu']||[]},{field:'Người upload',label:'Người upload',options:employees},{field:'Ngày upload',label:'Khoảng ngày',type:'date'}],
    audit:[{field:'Module',label:'Module',options:unique((APP.data.audit||[]).map(x=>x['Module']).filter(Boolean))},{field:'Hành động',label:'Hành động',options:unique((APP.data.audit||[]).map(x=>x['Hành động']).filter(Boolean))},{field:'Mã người dùng',label:'Người dùng',options:userFilterOptions()},{field:'Thời gian',label:'Khoảng ngày',type:'date'}],
    users:[{field:'Vai trò',label:'Vai trò',options:fixed.userRole||[]},{field:'Trạng thái',label:'Trạng thái',options:fixed.userStatus||[]},{field:'Mã nhân sự',label:'Nhân sự',options:employees},{field:'Lần đăng nhập gần nhất',label:'Khoảng ngày',type:'date'}]
  };
  if(base[module]) return base[module];
  return (originalSpecs||[]).map(([field,options])=>({field,label:field,options:options||[]}));
}
function filterLabelFor(field,value){
  if(field==='Mã dự án') return projectName(value)||value;
  if(field==='Mã nhân sự'||field==='Mã người phụ trách'||field==='Mã quản lý trực tiếp'||field==='Người upload') return employeeName(value)||value;
  if(field==='Mã người dùng') return userName(value)||value;
  return value;
}
function getInlineFilterSet(module,field){
  APP.state.filters[module]=APP.state.filters[module]||{};
  APP.state.filters[module][field]=APP.state.filters[module][field]||new Set();
  return APP.state.filters[module][field];
}
function activeFilterCount(module,field){
  const n=(APP.state.filters[module]?.[field]?.size)||0;
  const d=APP.state.dateFilters?.[module]?.[field];
  return n+(d&&(d.from||d.to)?1:0);
}
function moduleActiveFilterCount(module){
  const normal=Object.values(APP.state.filters[module]||{}).reduce((s,set)=>s+(set?.size||0),0);
  const dates=Object.values(APP.state.dateFilters?.[module]||{}).filter(v=>v&&(v.from||v.to)).length;
  return normal+dates;
}
function renderInlineFilterControl(module,spec){
  const count=activeFilterCount(module,spec.field);
  if(spec.type==='date'||spec.type==='month'){
    const val=APP.state.dateFilters?.[module]?.[spec.field]||{};
    return `<div class="inline-filter"><button class="inline-filter-trigger ${count?'has-value':''}" data-action="filter-menu-toggle"><span>${escapeHtml(spec.label)}</span>${count?`<b>${count}</b>`:''}<span class="material-symbols-rounded">expand_more</span></button><div class="inline-filter-menu date-filter-menu hidden"><div class="inline-filter-menu-head"><strong>${escapeHtml(spec.label)}</strong><button data-action="clear-one-filter-field" data-module="${module}" data-field="${escapeAttr(spec.field)}">Xóa</button></div><label>Từ</label><input type="${spec.type==='month'?'month':'date'}" data-filter-date data-filter-type="${spec.type}" data-module="${module}" data-field="${escapeAttr(spec.field)}" data-part="from" value="${escapeAttr(val.from||'')}"><label>Đến</label><input type="${spec.type==='month'?'month':'date'}" data-filter-date data-filter-type="${spec.type}" data-module="${module}" data-field="${escapeAttr(spec.field)}" data-part="to" value="${escapeAttr(val.to||'')}"><small>Thay đổi là lọc ngay, không cần bấm Áp dụng.</small></div></div>`;
  }
  const options=(spec.options||[]).map(normalizeFilterOption).filter(o=>o.value);
  const set=APP.state.filters[module]?.[spec.field]||new Set();
  return `<div class="inline-filter"><button class="inline-filter-trigger ${count?'has-value':''}" data-action="filter-menu-toggle"><span>${escapeHtml(spec.label)}</span>${count?`<b>${count}</b>`:''}<span class="material-symbols-rounded">expand_more</span></button><div class="inline-filter-menu hidden"><div class="inline-filter-menu-head"><strong>${escapeHtml(spec.label)}</strong><button data-action="clear-one-filter-field" data-module="${module}" data-field="${escapeAttr(spec.field)}">Xóa</button></div><div class="inline-filter-options">${options.length?options.map(o=>`<button class="inline-filter-option ${set.has(o.value)?'active':''}" data-action="inline-filter-option" data-module="${module}" data-field="${escapeAttr(spec.field)}" data-value="${encodeURIComponent(o.value)}"><span class="filter-check"></span><span>${escapeHtml(o.label||filterLabelFor(spec.field,o.value))}</span></button>`).join(''):`<div class="inline-filter-empty">Chưa có dữ liệu phù hợp</div>`}</div></div></div>`;
}
moduleToolbar = function(module,filterSpecs,actions='',viewToggle=false){
  patch3EnsureState();
  const specs=inlineFilterSpecsFor(module,filterSpecs);
  APP.state.filterSpecs=APP.state.filterSpecs||{};APP.state.filterSpecs[module]=specs;
  const views=viewToggle?`<div class="view-controls">${module==='projects'?viewButtons('projects',['cards','table']):module==='employees'?viewButtons('employees',['cards','table']):module==='kpiMonths'?viewButtons('kpi',['cards','table']):''}</div>`:'';
  const active=moduleActiveFilterCount(module);
  return `<div class="panel module-toolbar module-toolbar-inline"><div class="module-toolbar-main"><div class="search-box"><span class="material-symbols-rounded">search</span><input data-search-module="${module}" value="${escapeAttr(APP.state.search[module]||'')}" placeholder="Tìm trong dữ liệu hiện tại..."></div><div class="toolbar-right">${views}<select data-sort="${module}" class="soft-select"><option value="newest" ${(APP.state.sort[module]||'newest')==='newest'?'selected':''}>Mới nhất</option><option value="oldest" ${APP.state.sort[module]==='oldest'?'selected':''}>Cũ nhất</option></select><select data-page-size="${module}" class="soft-select">${[10,50,100].map(n=>`<option value="${n}" ${(APP.state.pageSize[module]||10)===n?'selected':''}>${n} dòng</option>`).join('')}</select></div></div>${specs.length?`<div class="inline-filter-row"><div class="inline-filter-label"><span class="material-symbols-rounded">filter_alt</span>Bộ lọc</div>${specs.map(spec=>renderInlineFilterControl(module,spec)).join('')}${active?`<button class="clear-inline-filters" data-action="clear-module-filters" data-module="${module}"><span class="material-symbols-rounded">filter_alt_off</span>Xóa tất cả</button>`:''}</div>`:''}</div>`;
};

function toggleInlineFilterOption(module,field,value){
  const set=getInlineFilterSet(module,field);
  set.has(value)?set.delete(value):set.add(value);
  APP.state.pageNo[module]=1;
  renderCurrentPage();
}
function clearOneFilterField(module,field){
  if(APP.state.filters[module]?.[field]) APP.state.filters[module][field].clear();
  if(APP.state.dateFilters?.[module]?.[field]) delete APP.state.dateFilters[module][field];
  APP.state.pageNo[module]=1;
  renderCurrentPage();
}
function clearAllInlineFilters(module){
  APP.state.filters[module]={};
  if(APP.state.dateFilters) APP.state.dateFilters[module]={};
  APP.state.pageNo[module]=1;
  renderCurrentPage();
}
function updateInlineDateFilter(module,field,part,value,type){
  APP.state.dateFilters=APP.state.dateFilters||{};APP.state.dateFilters[module]=APP.state.dateFilters[module]||{};APP.state.dateFilters[module][field]=APP.state.dateFilters[module][field]||{type};
  APP.state.dateFilters[module][field].type=type;
  APP.state.dateFilters[module][field][part]=value||'';
  APP.state.pageNo[module]=1;
  renderCurrentPage();
}
function parseFilterBoundary(value,type,end){
  if(!value) return null;
  if(type==='month'){
    const m=String(value).match(/^(\d{4})-(\d{2})$/);if(!m)return null;
    return end?new Date(+m[1],+m[2],0,23,59,59,999):new Date(+m[1],+m[2]-1,1);
  }
  const d=parseDateFromIso(value)||parseDate(value);if(!d)return null;
  return end?endOfDay(d):startOfDay(d);
}
applyGenericFilters = function(module,rows){
  patch3EnsureState();
  const f=APP.state.filters[module]||{};
  const df=APP.state.dateFilters?.[module]||{};
  return (rows||[]).filter(r=>{
    const normalOk=Object.entries(f).every(([field,set])=>!set||!set.size||set.has(String(computedFilterValue(r,field)??'')));
    if(!normalOk) return false;
    return Object.entries(df).every(([field,rule])=>{
      if(!rule || (!rule.from&&!rule.to)) return true;
      const rowDate=parseDate(r[field]);
      if(!rowDate) return false;
      const from=parseFilterBoundary(rule.from,rule.type,false),to=parseFilterBoundary(rule.to,rule.type,true);
      return (!from||rowDate>=from)&&(!to||rowDate<=to);
    });
  });
};

renderKpiTemplates = function(){
  const module='kpiTemplates';let rows=APP.data.kpiTemplates||[];
  rows=applySearchFilter(module,rows,['Mã mẫu KPI','Tên mẫu KPI','Giá trị áp dụng','Trạng thái','Phạm vi áp dụng']);
  rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Ngày tạo');
  const actions=`<button class="btn btn-primary" data-action="new-template"><span class="material-symbols-rounded">add</span>Thêm mẫu KPI</button><button class="btn" data-action="export-xlsx" data-module="kpiTemplates"><span class="material-symbols-rounded">download</span>Export</button>`;
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Mẫu KPI','Mỗi bộ KPI gồm các chỉ tiêu, mục tiêu, trọng số và cách ghi nhận. Tổng trọng số cần bằng 100%.',actions)}${moduleToolbar(module,[], '',false)}<div class="panel table-panel table-panel-v2">${rows.length?`<div class="data-table-wrap"><table class="data-table data-table-v2"><thead><tr><th>Thao tác</th><th>Mẫu KPI</th><th>Áp dụng</th><th>Ngày hiệu lực</th><th>Chỉ tiêu</th><th>Trọng số</th><th>Trạng thái</th></tr></thead><tbody>${paginatedRows(module,rows).map(t=>{const details=(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===t['Mã mẫu KPI']);const weight=details.reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0);return `<tr><td><div class="row-actions"><button class="row-action view" data-action="view-template" data-id="${t['Mã mẫu KPI']}"><span class="material-symbols-rounded">visibility</span></button><button class="row-action edit" data-action="edit-template" data-id="${t['Mã mẫu KPI']}"><span class="material-symbols-rounded">edit</span></button>${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-template" data-id="${t['Mã mẫu KPI']}"><span class="material-symbols-rounded">delete</span></button>`:''}</div></td><td class="main-cell"><strong>${escapeHtml(t['Tên mẫu KPI'])}</strong><small>${escapeHtml(t['Mã mẫu KPI'])}</small></td><td>${escapeHtml(t['Phạm vi áp dụng'])}: <strong>${escapeHtml(t['Giá trị áp dụng'])}</strong></td><td>${formatDate(t['Ngày hiệu lực'])}</td><td>${details.length}</td><td><span class="badge ${Math.round(weight)===100?'badge-green':'badge-red'}">${round1(weight)}%</span></td><td>${statusBadge(t['Trạng thái'])}</td></tr>`}).join('')}</tbody></table></div>`:emptyState('description','Chưa có mẫu KPI','Hãy tạo bộ KPI đầu tiên cho Nhóm hoặc điều chỉnh bộ lọc.')}${tableFooter(module,rows.length)}</div></div>`;
};

renderKpiEvaluation = function(){
  const module='kpiEvaluation';let rows=periodFilter(APP.data.kpiMonths||[],'Kỳ').filter(k=>k['Trạng thái KPI']!=='Đã chốt');
  rows=applySearchFilter(module,rows,['Mã nhân sự','Trạng thái KPI']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Kỳ');
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Đánh giá KPI','Chỉ tiêu tự động lấy từ công việc. Nhóm tự nhập điểm cho các chỉ tiêu đánh giá thủ công.')} ${moduleToolbar(module,[], '',false)}<div class="panel table-panel table-panel-v2">${rows.length?`<div class="data-table-wrap"><table class="data-table data-table-v2"><thead><tr><th>Thao tác</th><th>Nhân sự</th><th>Kỳ</th><th>Trạng thái</th><th>Điểm hiện tại</th><th>Chỉ tiêu cần đánh giá</th></tr></thead><tbody>${paginatedRows(module,rows).map(k=>{const details=kpiDetails(k['Mã KPI tháng']);const manual=details.filter(d=>d['Nguồn số liệu']==='Nhóm tự nhập'&&d['Trạng thái']!=='Đã đánh giá').length;return `<tr><td><button class="btn btn-sm btn-primary" data-action="evaluate-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">fact_check</span>Đánh giá</button></td><td>${personInline(k['Mã nhân sự'])}</td><td>${formatPeriod(k['Kỳ'])}</td><td>${statusBadge(k['Trạng thái KPI'])}</td><td><strong>${round1(k['Tổng điểm KPI']||0)}</strong> / 120</td><td><span class="badge ${manual?'badge-orange':'badge-green'}">${manual?manual+' chỉ tiêu':'Đã đủ dữ liệu'}</span></td></tr>`}).join('')}</tbody></table></div>`:emptyState('fact_check','Không có KPI chờ đánh giá','Các KPI chưa chốt sẽ hiển thị ở đây.')}${tableFooter(module,rows.length)}</div></div>`;
};

renderKpiFinalize = function(){
  const module='kpiFinalize';let rows=periodFilter(APP.data.kpiMonths||[],'Kỳ').filter(k=>k['Trạng thái KPI']==='Đã đánh giá');
  rows=applySearchFilter(module,rows,['Mã nhân sự','Xếp loại','Nhận xét tổng hợp']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Kỳ');
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Chốt KPI','Kiểm tra điểm, xếp loại và khóa kết quả sau khi hoàn tất đánh giá.')} ${moduleToolbar(module,[], '',false)}<div class="panel table-panel table-panel-v2">${rows.length?`<div class="data-table-wrap"><table class="data-table data-table-v2"><thead><tr><th>Thao tác</th><th>Nhân sự</th><th>Kỳ</th><th>Điểm</th><th>Xếp loại</th><th>Nhận xét</th></tr></thead><tbody>${paginatedRows(module,rows).map(k=>`<tr><td><div class="row-actions"><button class="row-action view" data-action="view-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">visibility</span></button><button class="btn btn-sm btn-primary" data-action="finalize-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">lock</span>Chốt KPI</button></div></td><td>${personInline(k['Mã nhân sự'])}</td><td>${formatPeriod(k['Kỳ'])}</td><td><strong class="${Number(k['Tổng điểm KPI'])>100?'text-success':''}">${round1(k['Tổng điểm KPI']||0)}</strong> /120</td><td>${statusBadge(k['Xếp loại'])}</td><td>${escapeHtml(k['Nhận xét tổng hợp']||'')}</td></tr>`).join('')}</tbody></table></div>`:emptyState('lock_open','Không có KPI chờ chốt','KPI đã đánh giá sẽ xuất hiện tại đây.')}${tableFooter(module,rows.length)}</div></div>`;
};

function rolePermissionOverviewHtml(){
  const cards=[
    {role:'Quản trị',icon:'admin_panel_settings',tone:'violet',scope:'Toàn công ty',desc:'Thiết lập hệ thống và kiểm soát toàn bộ dữ liệu.',allow:['Toàn bộ Dashboard, Dự án, Công việc, Kanban, Gantt, Lịch, Nhắc việc','Tạo/sửa Nhân sự, Danh mục, Người dùng, Mẫu KPI','Đánh giá và chốt KPI; Import/Export; xem Nhật ký','Xóa dữ liệu và tài liệu khi cần'],deny:['Không giới hạn module nghiệp vụ trong hệ thống']},
    {role:'Quản lý',icon:'supervisor_account',tone:'blue',scope:'Đội nhóm',desc:'Điều hành công việc và KPI của bản thân cùng nhân sự trực thuộc.',allow:['Dashboard và dữ liệu đội nhóm','Tạo/quản lý Dự án, giao việc cho đội nhóm','Xem Nhân sự thuộc đội; đánh giá/chốt KPI đội nhóm','Import dữ liệu nghiệp vụ, nhắc việc, xem Nhật ký liên quan'],deny:['Không thấy Người dùng, Danh mục, Mẫu KPI','Không được xóa dữ liệu hệ thống hoặc xóa file']},
    {role:'Nhóm',icon:'badge',tone:'green',scope:'Cá nhân',desc:'Thực hiện công việc, theo dõi dự án liên quan và KPI cá nhân.',allow:['Dashboard cá nhân; Dự án/Công việc có liên quan','Kanban, Gantt, Lịch và Nhắc việc trong phạm vi cá nhân','Cập nhật tiến độ, kết quả, trạng thái công việc mình phụ trách','Xem KPI cá nhân và tài liệu liên quan'],deny:['Không thấy Nhân sự, Danh mục, Người dùng, Nhật ký','Không giao việc mới, không xác nhận Hoàn thành, không đánh giá/chốt KPI']}
  ];
  return `<section class="role-access-section"><div class="role-access-head"><div><h2>Ma trận phân quyền</h2><p>Vai trò quyết định đồng thời module được hiển thị, thao tác được phép và phạm vi dữ liệu trả về từ hệ thống.</p></div><span class="role-policy-badge">3 vai trò chuẩn</span></div><div class="role-access-grid">${cards.map(c=>`<article class="role-access-card tone-${c.tone}"><div class="role-access-title"><span class="material-symbols-rounded">${c.icon}</span><div><h3>${c.role}</h3><small>Phạm vi: <b>${c.scope}</b></small></div></div><p>${c.desc}</p><div class="role-access-list"><strong>Được phép</strong>${c.allow.map(x=>`<span><i class="material-symbols-rounded">check_circle</i>${x}</span>`).join('')}</div><div class="role-access-list denied"><strong>Không hiển thị / không được phép</strong>${c.deny.map(x=>`<span><i class="material-symbols-rounded">block</i>${x}</span>`).join('')}</div></article>`).join('')}</div></section>`;
}

renderUsers = function(){
  const module='users';let rows=APP.data.users||[];rows=applySearchFilter(module,rows,['Mã người dùng','Tên đăng nhập','Vai trò','Mã nhân sự','Trạng thái']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Mã người dùng');
  const actions=APP.permissions.canManageUsers?`<button class="btn btn-primary" data-action="new-user"><span class="material-symbols-rounded">person_add</span>Thêm người dùng</button>`:'';
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Người dùng','Phân quyền theo 3 vai trò chuẩn. Phạm vi dữ liệu được hệ thống tự khóa theo vai trò để tránh cấp sai quyền.',actions)}${rolePermissionOverviewHtml()}${moduleToolbar(module,[], '',true)}<div class="panel table-panel table-panel-v2">${rows.length?`<div class="data-table-wrap"><table class="data-table data-table-v2"><thead><tr><th>Thao tác</th><th>Tài khoản</th><th>Nhân sự</th><th>Vai trò</th><th>Phạm vi</th><th>Trạng thái</th><th>Đăng nhập gần nhất</th></tr></thead><tbody>${paginatedRows(module,rows).map(u=>`<tr><td><div class="row-actions"><button class="row-action edit" data-action="edit-user" data-id="${u['Mã người dùng']}"><span class="material-symbols-rounded">edit</span></button>${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-user" data-id="${u['Mã người dùng']}"><span class="material-symbols-rounded">delete</span></button>`:''}</div></td><td class="main-cell"><strong>${escapeHtml(u['Tên đăng nhập'])}</strong><small>${escapeHtml(u['Mã người dùng'])}</small></td><td>${personInline(u['Mã nhân sự'])}</td><td>${statusBadge(u['Vai trò'])}</td><td><span class="scope-badge">${escapeHtml(u['Phạm vi dữ liệu']||roleScope(u['Vai trò']))}</span></td><td>${statusBadge(u['Trạng thái'])}</td><td>${formatDateTime(u['Lần đăng nhập gần nhất'])||'-'}</td></tr>`).join('')}</tbody></table></div>`:emptyState('manage_accounts','Chưa có người dùng','Thêm tài khoản và liên kết với nhân sự.')}${tableFooter(module,rows.length)}</div></div>`;
};

renderAudit = function(){
  const module='audit';let rows=APP.data.audit||[];rows=applySearchFilter(module,rows,['Mã nhật ký','Mã người dùng','Module','Mã bản ghi','Hành động','Nội dung thay đổi']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Thời gian');
  document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Nhật ký hoạt động','Theo dõi thao tác quan trọng. Nhật ký chỉ ghi nhận, không chỉnh sửa trực tiếp.')} ${moduleToolbar(module,[], '',false)}<div class="panel table-panel table-panel-v2">${rows.length?`<div class="data-table-wrap"><table class="data-table data-table-v2"><thead><tr><th>Thời gian</th><th>Người dùng</th><th>Module</th><th>Bản ghi</th><th>Hành động</th><th>Nội dung</th><th>Kết quả</th></tr></thead><tbody>${paginatedRows(module,rows).map(a=>`<tr><td>${formatDateTime(a['Thời gian'])}</td><td>${escapeHtml(userName(a['Mã người dùng']))}</td><td>${escapeHtml(a['Module'])}</td><td>${escapeHtml(a['Mã bản ghi'])}</td><td><strong>${escapeHtml(a['Hành động'])}</strong></td><td>${escapeHtml(a['Nội dung thay đổi'])}</td><td>${statusBadge(a['Kết quả']||'Thành công')}</td></tr>`).join('')}</tbody></table></div>`:emptyState('history','Chưa có nhật ký','Các thao tác quan trọng sẽ được ghi nhận tại đây.')}${tableFooter(module,rows.length)}</div></div>`;
};




/* ============================================================================
   SME UI/UX PATCH 4 - refresh loading, inline filters, quick category create,
   multiline categories and field-specific tooltips
============================================================================ */

const SME_PATCH4_BASE_ROUTE_ACTION = routeAction;
const SME_PATCH4_BASE_HANDLE_CLICK = handleClick;
const SME_PATCH4_BASE_OPEN_MODAL = openModal;
const SME_PATCH4_BASE_RENDER_TASK_WIZARD = typeof renderTaskWizard === 'function' ? renderTaskWizard : null;
const SME_PATCH4_BASE_RENDER_IMPORT_PREVIEW = typeof renderImportPreview === 'function' ? renderImportPreview : null;

const QUICK_CATEGORY_FIELD_MAP = {
  'Nhóm':'Nhóm',
  'Chức vụ':'Chức vụ',
  'Loại dự án':'Loại dự án',
  'Nhóm công việc':'Nhóm công việc',
  'Nhóm KPI':'Nhóm KPI',
  'Đơn vị tính':'Đơn vị tính',
  'Loại tài liệu':'Loại tài liệu'
};

Object.assign(FIELD_TOOLTIPS.employees, {
  'Mã nhân sự':'Mã hồ sơ nhân sự do hệ thống tự sinh. Mã này dùng để liên kết tài khoản, công việc, dự án và KPI.',
  'Nhóm':'Chọn Nhóm đang làm việc. Dữ liệu này dùng để phân quyền đội nhóm, lọc báo cáo và tổng hợp KPI theo Nhóm.',
  'Chức vụ':'Chọn chức vụ hiện tại từ Danh mục. Dữ liệu giúp nhận biết vai trò khi phân việc và xem hồ sơ nhân sự.',
  'Mã quản lý trực tiếp':'Chọn mã - tên quản lý trực tiếp. Hệ thống dùng trường này để xác định đội nhóm, quyền xác nhận và phạm vi đánh giá KPI.',
});
Object.assign(FIELD_TOOLTIPS.projects, {
  'Mã dự án':'Mã dự án do hệ thống tự sinh. Mã này dùng để liên kết công việc, thành viên, tài liệu và báo cáo dự án.',
  'Ngày hoàn thành thực tế':'Nhập ngày hoàn thành thực tế khi dự án kết thúc. Dữ liệu này dùng để đối chiếu kế hoạch và báo cáo tiến độ.',
  'Người tạo':'Hệ thống tự ghi nhận người tạo hồ sơ để phục vụ truy vết nhật ký và phân quyền dữ liệu.',
  'Ngày tạo':'Hệ thống tự ghi nhận thời điểm tạo dự án, dùng cho sắp xếp và nhật ký hoạt động.'
});
Object.assign(FIELD_TOOLTIPS.tasks, {
  'Mã công việc':'Mã công việc do hệ thống tự sinh. Mã này dùng để liên kết người tham gia, file đính kèm, nhật ký và báo cáo KPI.',
  'Mã dự án':'Chọn theo dạng Mã - Tên dự án. Công việc sẽ được tổng hợp vào tiến độ và báo cáo của dự án được chọn.',
  'Nhóm công việc':'Chọn nhóm công việc từ Danh mục. Dữ liệu này dùng để lọc, phân tích khối lượng và báo cáo cơ cấu công việc.',
  'Mã người phụ trách':'Chọn đúng một người chịu trách nhiệm chính. KPI hoàn thành công việc mặc định tính cho người phụ trách chính này.',
  'Mã người giao việc':'Hệ thống ghi nhận người giao việc để truy vết trách nhiệm và hỗ trợ phân quyền theo đội nhóm.',
  'Hạn hoàn thành':'Chọn ngày phải hoàn tất công việc. Trường này dùng để xác định sắp đến hạn, quá hạn, lịch công việc và KPI đúng hạn.',
  'Ngày hoàn thành thực tế':'Hệ thống cập nhật khi quản lý xác nhận Hoàn thành. Dữ liệu dùng để tính đúng hạn/trễ hạn.',
  'Mã quản lý xác nhận':'Hệ thống ghi nhận quản lý đã xác nhận hoàn thành để kiểm tra lịch sử phê duyệt.',
  'Ngày xác nhận':'Thời điểm quản lý xác nhận kết quả. Dữ liệu dùng cho nhật ký và báo cáo chất lượng xử lý.',
  'File đã chọn':'Có thể upload ảnh, PDF, tài liệu hoặc chứng từ liên quan đến công việc. File được lưu sau khi bản ghi công việc được lưu thành công.',
  'Người tham gia':'Chọn các nhân sự phối hợp thực hiện. Người tham gia được xem/cập nhật theo phạm vi nhưng không được tính là người phụ trách KPI chính.'
});
FIELD_TOOLTIPS.projectMembers = {
  'Mã liên kết':'Mã liên kết do hệ thống tự sinh để nối dự án với từng nhân sự tham gia.',
  'Mã dự án':'Chọn dự án cần bổ sung thành viên. Dữ liệu dùng để hiển thị thành viên trong hồ sơ dự án.',
  'Mã nhân sự':'Chọn nhân sự tham gia theo dạng Mã - Tên để tránh nhầm người.',
  'Vai trò tham gia':'Chọn vai trò của nhân sự trong dự án như Thành viên, Hỗ trợ hoặc Điều phối.',
  'Ngày tham gia':'Chọn ngày nhân sự bắt đầu tham gia dự án. Dữ liệu dùng để theo dõi lịch sử tham gia.',
  'Trạng thái':'Chọn Đang tham gia hoặc Đã kết thúc để biết nhân sự còn thuộc dự án hay không.',
  'Ghi chú':'Nhập vai trò chi tiết hoặc ghi chú bổ sung cho thành viên dự án.'
};
FIELD_TOOLTIPS.taskParticipants = {
  'Mã liên kết':'Mã liên kết do hệ thống tự sinh để nối công việc với từng người tham gia.',
  'Mã công việc':'Chọn công việc cần bổ sung người phối hợp.',
  'Mã nhân sự':'Chọn nhân sự tham gia theo dạng Mã - Tên để tránh nhầm người.',
  'Vai trò tham gia':'Chọn vai trò phối hợp, hỗ trợ hoặc theo dõi trong công việc.',
  'Ngày tham gia':'Chọn ngày bắt đầu tham gia công việc. Dữ liệu dùng để theo dõi lịch sử phối hợp.',
  'Trạng thái':'Chọn trạng thái tham gia hiện tại của nhân sự trong công việc.',
  'Ghi chú':'Nhập ghi chú về phạm vi phối hợp hoặc nhiệm vụ phụ.'
};
Object.assign(FIELD_TOOLTIPS.kpiTemplates, {
  'Mã mẫu KPI':'Mã mẫu KPI do hệ thống tự sinh. Mã này dùng để tạo KPI tháng và liên kết các chỉ tiêu mẫu.',
  'Phạm vi áp dụng':'Chọn mẫu KPI áp dụng cho Nhóm, Chức vụ hoặc Nhân sự cụ thể.',
  'Giá trị áp dụng':'Nhập/chọn giá trị tương ứng với phạm vi áp dụng. Ví dụ phạm vi là Nhóm thì giá trị là tên Nhóm.',
  'Mô tả':'Mô tả mục đích của bộ KPI, nhóm nhân sự áp dụng và lưu ý khi đánh giá.',
  'Ngày tạo':'Hệ thống tự ghi nhận ngày tạo mẫu KPI để phục vụ sắp xếp và nhật ký.'
});
FIELD_TOOLTIPS.kpiTemplateDetails = {
  'Mã chỉ tiêu mẫu':'Mã chỉ tiêu do hệ thống tự sinh, dùng để tạo chi tiết KPI tháng từ mẫu KPI.',
  'Mã mẫu KPI':'Chọn mẫu KPI chứa chỉ tiêu này. Mỗi chỉ tiêu phải thuộc một mẫu KPI cụ thể.',
  'Tên chỉ tiêu':'Nhập tên chỉ tiêu KPI rõ ràng, đo được và dễ hiểu khi đánh giá.',
  'Nhóm KPI':'Chọn nhóm KPI từ Danh mục để phân loại chỉ tiêu trong báo cáo.',
  'Đơn vị tính':'Nhập đơn vị đo của chỉ tiêu, ví dụ %, Điểm, Việc hoặc Lần.',
  'Mục tiêu mặc định':'Nhập mục tiêu chuẩn của chỉ tiêu. Điểm KPI được tính dựa trên thực tế so với mục tiêu này.',
  'Trọng số (%)':'Nhập tỷ trọng của chỉ tiêu trong tổng KPI. Tổng trọng số các chỉ tiêu đang áp dụng nên bằng 100%.',
  'Cách ghi nhận':'Chọn Tự động hệ thống hoặc Nhóm tự nhập. Trường này quyết định nguồn số liệu khi đánh giá KPI.',
  'Chiều đánh giá':'Chọn Càng cao càng tốt hoặc Càng thấp càng tốt để hệ thống tính điểm đúng logic.',
  'Điểm tối đa':'Điểm tối đa của chỉ tiêu, mặc định theo nguyên tắc KPI tối đa 120.',
  'Trạng thái':'Chỉ tiêu Đang áp dụng sẽ được dùng khi tạo KPI tháng mới.',
  'Ghi chú':'Nhập lưu ý về cách đo, nguồn dữ liệu hoặc điều kiện đánh giá chỉ tiêu.'
};
FIELD_TOOLTIPS.kpiMonths = {
  'Mã KPI tháng':'Mã hồ sơ KPI tháng do hệ thống tự sinh, dùng để liên kết các chi tiết KPI.',
  'Kỳ':'Chọn tháng/năm đánh giá KPI. Dữ liệu dùng để lọc Dashboard, báo cáo và tính công việc trong kỳ.',
  'Mã nhân sự':'Chọn nhân sự được đánh giá KPI theo dạng Mã - Tên.',
  'Mã mẫu KPI':'Chọn mẫu KPI dùng để tạo bộ chỉ tiêu cho kỳ đánh giá.',
  'Mã quản lý đánh giá':'Chọn quản lý phụ trách đánh giá KPI của nhân sự trong kỳ.',
  'Trạng thái KPI':'Theo dõi luồng KPI từ Đang theo dõi, Chờ quản lý duyệt, Đã đánh giá đến Đã chốt.',
  'Tổng điểm KPI':'Tổng điểm quy đổi của các chỉ tiêu, được giới hạn tối đa 120.',
  'Xếp loại':'Hệ thống tự phân loại theo tổng điểm KPI để phục vụ báo cáo.',
  'Nhận xét tổng hợp':'Nhập nhận xét cuối kỳ của quản lý. Nội dung này hiển thị trong hồ sơ KPI và báo cáo.',
  'Ngày đánh giá':'Hệ thống ghi nhận ngày quản lý đánh giá KPI.',
  'Ngày chốt':'Hệ thống ghi nhận ngày khóa kết quả KPI cuối kỳ.',
  'Người chốt':'Người thực hiện thao tác chốt KPI.'
};
FIELD_TOOLTIPS.kpiDetails = {
  'Mã chi tiết KPI':'Mã chi tiết do hệ thống tự sinh để theo dõi từng chỉ tiêu trong KPI tháng.',
  'Mã KPI tháng':'Mã hồ sơ KPI tháng mà chỉ tiêu này thuộc về.',
  'Mã chỉ tiêu mẫu':'Mã chỉ tiêu gốc từ mẫu KPI, dùng để truy vết nguồn cấu hình.',
  'Tên chỉ tiêu':'Tên chỉ tiêu được đánh giá trong kỳ KPI.',
  'Nhóm KPI':'Nhóm phân loại chỉ tiêu để tổng hợp báo cáo KPI.',
  'Đơn vị tính':'Đơn vị đo của chỉ tiêu, ví dụ %, Điểm hoặc Việc.',
  'Mục tiêu':'Mục tiêu cần đạt trong kỳ. Điểm chỉ tiêu được tính từ thực tế so với mục tiêu.',
  'Thực tế':'Nhập số thực tế đạt được hoặc để hệ thống tự lấy nếu nguồn là Tự động hệ thống.',
  'Điểm chỉ tiêu':'Điểm trước khi nhân trọng số, tối đa 120 theo nguyên tắc KPI đã chốt.',
  'Trọng số (%)':'Tỷ trọng của chỉ tiêu trong tổng điểm KPI tháng.',
  'Điểm quy đổi':'Điểm chỉ tiêu sau khi nhân trọng số, dùng để cộng vào tổng KPI.',
  'Nguồn số liệu':'Cho biết chỉ tiêu lấy số liệu tự động từ công việc hay do quản lý nhập thủ công.',
  'Nhận xét quản lý':'Nhập nhận xét riêng cho chỉ tiêu khi quản lý đánh giá.',
  'Trạng thái':'Trạng thái đánh giá của chỉ tiêu trong kỳ KPI.'
};
FIELD_TOOLTIPS.files = {
  'Mã tài liệu':'Mã tài liệu do hệ thống tự sinh để liên kết file với hồ sơ nghiệp vụ.',
  'Ngày upload':'Ngày file được tải lên hệ thống. Dữ liệu dùng để lọc và truy vết tài liệu.',
  'Module liên quan':'Chọn module mà file thuộc về, ví dụ Dự án, Công việc hoặc KPI tháng.',
  'Mã bản ghi liên quan':'Chọn mã hồ sơ cần gắn tài liệu. File chỉ hiển thị trong hồ sơ được liên kết.',
  'Loại tài liệu':'Chọn loại tài liệu từ Danh mục để phân loại file trong hồ sơ và báo cáo.',
  'Tên file':'Tên file gốc khi upload. Nên đặt tên dễ nhận biết nội dung tài liệu.',
  'MIME type':'Định dạng file do hệ thống ghi nhận, dùng để xác định cách xem trước ảnh, PDF hoặc text.',
  'Dung lượng KB':'Dung lượng file tính theo KB để kiểm soát giới hạn upload và tải xem trước.',
  'File ID':'ID file trên Google Drive, dùng để mở file và lấy dữ liệu preview.',
  'Link xem':'Đường dẫn mở file trên Google Drive.',
  'Link tải':'Đường dẫn tải file về máy.',
  'Người upload':'Nhân sự đã upload file, dùng để truy vết trách nhiệm tài liệu.',
  'Trạng thái':'File Hoạt động được hiển thị; file Đã xóa chỉ còn trong lịch sử nếu cần truy vết.',
  'Ghi chú':'Nhập mô tả ngắn về nội dung hoặc mục đích của file.'
};
FIELD_TOOLTIPS.categories = {
  'Nhóm danh mục':'Nhóm dữ liệu linh hoạt đang được chỉnh, ví dụ Nhóm, Chức vụ, Loại dự án hoặc Nhóm KPI.',
  'Giá trị':'Nhập một hoặc nhiều giá trị danh mục. Khi thêm mới có thể xuống dòng, mỗi dòng là một giá trị riêng.',
  'Giá trị danh mục':'Nhập tên giá trị dùng để phân loại dữ liệu linh hoạt. Không dùng để thay thế trạng thái/công thức cố định của hệ thống.'
};

openModal = function(html){
  SME_PATCH4_BASE_OPEN_MODAL(html);
  requestAnimationFrame(enhanceWizardTableTooltips);
};

if(SME_PATCH4_BASE_RENDER_TASK_WIZARD){
  renderTaskWizard = function(){
    const out = SME_PATCH4_BASE_RENDER_TASK_WIZARD.apply(this,arguments);
    requestAnimationFrame(enhanceWizardTableTooltips);
    return out;
  };
}
if(SME_PATCH4_BASE_RENDER_IMPORT_PREVIEW){
  renderImportPreview = function(){
    const out = SME_PATCH4_BASE_RENDER_IMPORT_PREVIEW.apply(this,arguments);
    requestAnimationFrame(enhanceWizardTableTooltips);
    return out;
  };
}

function enhanceWizardTableTooltips(){
  document.querySelectorAll('.wizard-table th').forEach(th=>{
    if(th.querySelector('[data-tooltip]')) return;
    const label=(th.textContent||'').replace(/\s+/g,' ').trim();
    if(!label || ['TT','Thao tác','Trạng thái','Mô tả lỗi','Dòng'].includes(label)) return;
    let module='tasks';
    const modalText=(document.querySelector('#modal-root .modal-head h2')?.textContent||'')+' '+(document.querySelector('#modal-root .form-section-title')?.textContent||'');
    if((th.closest('#import-preview') || modalText.includes('Import')) && APP.state.import?.module) module=APP.state.import.module;
    else if(modalText.includes('Mẫu KPI') || modalText.includes('Chỉ tiêu KPI')) module='kpiTemplateDetails';
    else if(APP.state.wizard?.module) module=APP.state.wizard.module;
    const tip=getFieldTooltip(module,label) || getFieldTooltip('tasks',label) || getFieldTooltip('kpiTemplateDetails',label);
    if(tip) th.insertAdjacentHTML('beforeend', tooltipIcon(tip));
  });
}

handleClick = async function(e){
  const tip=e.target.closest('[data-tooltip]');
  if(tip){
    e.preventDefault();
    e.stopPropagation();
    showTooltipPortal(tip,tip.dataset.tooltip||'');
    return;
  }
  return SME_PATCH4_BASE_HANDLE_CLICK(e);
};

document.addEventListener('click', function(e){
  if(!e.target.closest('[data-tooltip]') && !e.target.closest('#tooltip-portal')) hideTooltipPortal();
}, true);

routeAction = async function(action,el,e){
  patch3EnsureState?.();
  if(action==='filter-menu-toggle'){
    const box=el.closest('.inline-filter');
    const menu=box?.querySelector('.inline-filter-menu');
    if(!menu) return;
    const open=menu.classList.contains('hidden');
    closeInlineFilterMenus(menu);
    menu.classList.toggle('hidden',!open);
    box.classList.toggle('open',open);
    if(open) requestAnimationFrame(()=>fitInlineFilterMenu(menu));
    return;
  }
  if(action==='quick-create-category'){
    await quickCreateCategoryFromCombo();
    return;
  }
  return SME_PATCH4_BASE_ROUTE_ACTION(action,el,e);
};

function fitInlineFilterMenu(menu){
  if(!menu || menu.classList.contains('hidden')) return;
  menu.style.left='0';
  menu.style.right='auto';
  const r=menu.getBoundingClientRect();
  if(r.right>window.innerWidth-12){
    menu.style.left='auto';
    menu.style.right='0';
  }
  const r2=menu.getBoundingClientRect();
  if(r2.left<8){
    menu.style.left='0';
    menu.style.right='auto';
    menu.style.transform=`translateX(${8-r2.left}px)`;
  }else{
    menu.style.transform='none';
  }
}

refreshAll = async function(){
  const currentPage=APP.state.page||'dashboard';
  const currentTab=APP.state.dashboardTab;
  closeInlineFilterMenus?.();
  closeComboMenu?.();
  hideTooltipPortal?.();
  closeModal?.();
  setLoadingState('Đang làm mới dữ liệu','Đang đồng bộ dữ liệu mới nhất.',false);
  showEl('loading-screen');
  hideEl('app-container');
  try{
    const data=await gas('getBootstrapData',APP.token,{timeout:60000});
    APP.data=data;
    APP.session=data.session;
    APP.permissions=data.permissions||{};
    if(currentTab) APP.state.dashboardTab=currentTab;
    setUserShell();
    applyPermissions();
    hideEl('loading-screen');
    showEl('app-container');
    changePage(currentPage,true);
    showToast('Đã làm mới dữ liệu','Dữ liệu mới nhất đã được tải lại thành công.','success',3000);
  }catch(err){
    hideEl('loading-screen');
    if(/Phiên đăng nhập/.test(err.message||'')){
      localStorage.removeItem('sme_app_token');
      APP.token='';
      showLogin('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }
    showEl('app-container');
    renderCurrentPage();
    showToast('Không thể làm mới dữ liệu',err.message||'Đã xảy ra lỗi khi tải lại dữ liệu.','error',6000);
  }
};

comboHtml = function(field,value,options,placeholder='Tìm kiếm và chọn...',displayOverride=''){
  const normalized=(options||[]).map(o=>typeof o==='string'?{value:o,label:o}:o);
  const selected=normalized.find(o=>String(o.value)===String(value));
  const display=displayOverride||selected?.label||value||'';
  const quickGroup=QUICK_CATEGORY_FIELD_MAP[field]||'';
  return `<div class="combo" data-combo-field="${escapeAttr(field)}" ${quickGroup?`data-quick-group="${escapeAttr(quickGroup)}"`:''}><div class="combo-control"><input class="combo-display" value="${escapeAttr(display)}" placeholder="${escapeAttr(placeholder)}" autocomplete="off"><button class="combo-arrow" type="button"><span class="material-symbols-rounded">expand_more</span></button></div><input type="hidden" data-field="${escapeAttr(field)}" value="${escapeAttr(value||'')}"><div class="combo-source hidden">${normalized.map(o=>`<span data-value="${escapeAttr(o.value)}" data-label="${escapeAttr(o.label)}"></span>`).join('')}</div></div>`;
};

function renderComboMenu(options,query=''){
  if(!activeCombo)return;
  if(!comboMenu){comboMenu=document.createElement('div');comboMenu.className='combo-menu combo-menu-v4';document.body.appendChild(comboMenu);}
  comboIndex=-1;
  const field=activeCombo.dataset.comboField||activeCombo.dataset.wizardName||'';
  const quickGroup=activeCombo.dataset.quickGroup||QUICK_CATEGORY_FIELD_MAP[field]||'';
  const typed=String(query||activeCombo.querySelector('.combo-display')?.value||'').trim();
  const hasExact=(options||[]).some(o=>normalizeText(o.label)===normalizeText(typed)||normalizeText(o.value)===normalizeText(typed));
  const optionHtml=(options||[]).length?(options||[]).map((o,i)=>`<div class="combo-option" data-action="combo-select" data-index="${i}" data-value="${escapeAttr(o.value)}" data-label="${escapeAttr(o.label)}"><span>${escapeHtml(o.label)}</span></div>`).join(''):'<div class="combo-empty">Không tìm thấy lựa chọn phù hợp.</div>';
  const quickHtml=(quickGroup && typed && !hasExact)?`<button class="combo-quick-create" data-action="quick-create-category"><span class="material-symbols-rounded">add_circle</span><span>Tạo nhanh "${escapeHtml(typed)}" trong ${escapeHtml(quickGroup)}</span></button>`:'';
  comboMenu.innerHTML=optionHtml+quickHtml;
  positionFloating(comboMenu,activeCombo.querySelector('.combo-control'),true);
}

async function quickCreateCategoryFromCombo(){
  if(!activeCombo) return;
  const combo=activeCombo;
  const field=combo.dataset.comboField||combo.dataset.wizardName||'';
  const group=combo.dataset.quickGroup||QUICK_CATEGORY_FIELD_MAP[field]||'';
  const raw=String(combo.querySelector('.combo-display')?.value||'').trim();
  if(!group || !raw){showToast('Chưa thể tạo nhanh','Trường này chưa bật tạo nhanh hoặc chưa nhập giá trị.','warning');return;}
  const t=showToast('Đang tạo nhanh danh mục',`Đang thêm "${raw}" vào ${group}.`,'processing',0);
  try{
    const res=await gas('saveCategoryItem',group,'',raw,APP.token,{timeout:45000});
    mergeDataResult(res);
    activeCombo=combo;
    selectComboOption(raw,raw);
    updateToast(t,'Đã tạo nhanh danh mục',`Đã thêm "${raw}" vào ${group}.`,'success',3000);
  }catch(err){
    updateToast(t,'Không thể tạo nhanh',err.message,'error',5500);
  }
}

openCategoryModal = function(group,value=''){
  const isEdit=Boolean(value);
  const inputHtml=isEdit
    ? `<input id="category-value" value="${escapeAttr(value)}" placeholder="Nhập giá trị danh mục">`
    : `<textarea id="category-value" rows="7" placeholder="Mỗi dòng là một giá trị. Ví dụ:\nMarketing\nKinh doanh\nVận hành"></textarea>`;
  const help=isEdit
    ? 'Khi sửa chỉ nhập một giá trị. Hệ thống sẽ kiểm tra trùng và dữ liệu đang sử dụng.'
    : 'Có thể thêm nhiều giá trị cùng lúc bằng cách xuống dòng. Hệ thống tự bỏ dòng trống và kiểm tra giá trị trùng.';
  openModal(modalShell(isEdit?'Sửa giá trị danh mục':'Thêm giá trị danh mục',group,`<div class="form-grid"><div class="form-field full"><label>Nhóm danh mục ${tooltipIcon(getFieldTooltip('categories','Nhóm danh mục'))}</label><input value="${escapeAttr(group)}" readonly><div class="field-help">Nhóm đang chọn trong module Danh mục.</div></div><div class="form-field full"><label>Giá trị <span class="required">*</span>${tooltipIcon(getFieldTooltip('categories','Giá trị'))}</label>${inputHtml}<div class="field-help">${escapeHtml(help)}</div></div><input type="hidden" id="category-old" value="${escapeAttr(value)}"><input type="hidden" id="category-group" value="${escapeAttr(group)}"></div>`,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-category"><span class="material-symbols-rounded">save</span>Lưu giá trị</button>`,'small'));
};

saveCategoryModal = async function(){
  const group=document.getElementById('category-group')?.value||'';
  const oldV=document.getElementById('category-old')?.value||'';
  const newV=String(document.getElementById('category-value')?.value||'').trim();
  const count=newV.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).length;
  const t=showToast('Đang lưu danh mục',oldV?'Đang cập nhật giá trị danh mục.':`Đang thêm ${count||0} giá trị danh mục.`,'processing',0);
  try{
    const res=await gas('saveCategoryItem',group,oldV,newV,APP.token,{timeout:45000});
    mergeDataResult(res);
    closeModal();
    updateToast(t,'Đã lưu danh mục',oldV?'Giá trị danh mục đã được cập nhật.':`${count} giá trị đã được xử lý.`, 'success',3000);
    renderCurrentPage();
  }catch(err){
    updateToast(t,'Không thể lưu',err.message,'error',6000);
  }
};

const SME_PATCH4_BASE_MODULE_TOOLBAR = moduleToolbar;
moduleToolbar = function(module,filterSpecs,actions='',viewToggle=false){
  patch3EnsureState?.();
  const specs=inlineFilterSpecsFor(module,filterSpecs);
  APP.state.filterSpecs=APP.state.filterSpecs||{};
  APP.state.filterSpecs[module]=specs;
  const views=viewToggle?`<div class="view-controls">${module==='projects'?viewButtons('projects',['cards','table']):module==='employees'?viewButtons('employees',['cards','table']):module==='kpiMonths'?viewButtons('kpi',['cards','table']):''}</div>`:'';
  const active=moduleActiveFilterCount(module);
  return `<div class="panel module-toolbar module-toolbar-inline module-toolbar-patch4"><div class="module-toolbar-main"><div class="search-box"><span class="material-symbols-rounded">search</span><input data-search-module="${module}" value="${escapeAttr(APP.state.search[module]||'')}" placeholder="Tìm theo mã, tên, người phụ trách..."></div><div class="toolbar-right">${views}<select data-sort="${module}" class="soft-select"><option value="newest" ${(APP.state.sort[module]||'newest')==='newest'?'selected':''}>Mới nhất</option><option value="oldest" ${APP.state.sort[module]==='oldest'?'selected':''}>Cũ nhất</option></select><select data-page-size="${module}" class="soft-select">${[10,50,100].map(n=>`<option value="${n}" ${(APP.state.pageSize[module]||10)===n?'selected':''}>${n} dòng</option>`).join('')}</select></div></div>${specs.length?`<div class="inline-filter-row inline-filter-row-patch4"><div class="inline-filter-label"><span class="material-symbols-rounded">filter_alt</span>Bộ lọc</div>${specs.map(spec=>renderInlineFilterControl(module,spec)).join('')}${active?`<button class="clear-inline-filters" data-action="clear-module-filters" data-module="${module}"><span class="material-symbols-rounded">filter_alt_off</span>Xóa tất cả</button>`:''}</div>`:''}</div>`;
};

/* Cố định lại dropdown filter khi thay đổi kích thước hoặc cuộn */
window.addEventListener('resize', ()=>document.querySelectorAll('.inline-filter-menu:not(.hidden)').forEach(fitInlineFilterMenu));
window.addEventListener('scroll', ()=>document.querySelectorAll('.inline-filter-menu:not(.hidden)').forEach(fitInlineFilterMenu), true);




/* ===================== UX WIZARD PATCH 5 - compact business input flows ===================== */
(function(){
  const PATCH5_BASE_ROUTE_ACTION = typeof routeAction === 'function' ? routeAction : null;
  const PATCH5_BASE_CLOSE_MODAL = typeof closeModal === 'function' ? closeModal : null;
  const PATCH5_BASE_WIZARD_ADD_ROWS = typeof wizardAddRows === 'function' ? wizardAddRows : null;
  const PATCH5_BASE_WIZARD_REMOVE_ROW = typeof wizardRemoveRow === 'function' ? wizardRemoveRow : null;
  const PATCH5_BASE_WIZARD_DUPLICATE_ROW = typeof wizardDuplicateRow === 'function' ? wizardDuplicateRow : null;
  const PATCH5_BASE_WIZARD_REMOVE_EMPTY = typeof wizardRemoveEmpty === 'function' ? wizardRemoveEmpty : null;
  const PATCH5_BASE_WIZARD_SET_EXPANDED = typeof wizardSetExpanded === 'function' ? wizardSetExpanded : null;
  const PATCH5_BASE_WIZARD_TOGGLE_ROW = typeof wizardToggleRow === 'function' ? wizardToggleRow : null;

  closeModal = function(){
    APP.state.formWizard=null;
    if(PATCH5_BASE_CLOSE_MODAL) return PATCH5_BASE_CLOSE_MODAL();
    document.getElementById('modal-root').innerHTML='';
  };

  const PATCH5_BASE_CHANGE_PAGE = typeof changePage === 'function' ? changePage : null;
  if(PATCH5_BASE_CHANGE_PAGE){
    changePage = function(page,initial=false){
      return PATCH5_BASE_CHANGE_PAGE(page,initial);
    };
  }

  routeAction = async function(action,el,e){
    if(action==='new-project') return openProjectWizard(el?.dataset?.id||'');
    if(action==='edit-project') return openProjectWizard(el.dataset.id||'');
    if(action==='new-employee') return openEmployeeWizard(el?.dataset?.id||'');
    if(action==='edit-employee') return openEmployeeWizard(el.dataset.id||'');
    if(action==='new-user') return openUserWizard(el?.dataset?.id||'');
    if(action==='edit-user') return openUserWizard(el.dataset.id||'');
    if(action==='new-template') return openKpiTemplateWizard(el?.dataset?.id||'');
    if(action==='edit-template') return openKpiTemplateWizard(el.dataset.id||'');
    if(action==='new-kpi') return openCreateKpiWizard();
    if(action==='upload-file') return openUploadWizard();
    if(action==='smart-next') return smartWizardNext();
    if(action==='smart-back') return smartWizardBack();
    if(action==='smart-save') return smartWizardSave();
    if(action==='template-add-detail') return smartTemplateAddDetail();
    if(action==='template-remove-detail') return smartTemplateRemoveDetail(Number(el.dataset.index));
    if(PATCH5_BASE_ROUTE_ACTION) return PATCH5_BASE_ROUTE_ACTION(action,el,e);
  };

  openProjectModal = function(id=''){ return openProjectWizard(id); };
  openEmployeeModal = function(id=''){ return openEmployeeWizard(id); };
  openUserModal = function(id=''){ return openUserWizard(id); };
  openKpiTemplateModal = function(id=''){ return openKpiTemplateWizard(id); };
  openCreateKpiModal = function(){ return openCreateKpiWizard(); };
  openUploadModal = function(){ return openUploadWizard(); };

  function wizardShell(title,subtitle,step,total,body,footer,size='smart-wide',stepLabels=[]){
    const defaultLabels = total===3 ? ['Nhập thông tin','Bổ sung thông tin','Kiểm tra thông tin'] : ['Nhập thông tin','Kiểm tra thông tin'];
    const labels = Array.isArray(stepLabels) && stepLabels.length ? stepLabels : defaultLabels;
    const steps = Array.from({length:total},(_,i)=>`<div class="smart-step ${step===i+1?'active':step>i+1?'done':''}"><span>${i+1}</span><b>${escapeHtml(labels[i]||defaultLabels[i]||('Bước '+(i+1)))}</b></div>`).join('');
    return `<div class="modal ${size} smart-modal refined-smart-modal"><div class="modal-head smart-modal-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle||'')}</p></div><button class="modal-close" data-action="close-modal"><span class="material-symbols-rounded">close</span></button></div><div class="smart-steps">${steps}</div><div class="modal-body smart-modal-body">${body}</div><div class="modal-footer smart-modal-footer"><div id="wizard-progress-text" class="smart-progress-text"></div>${footer}</div></div>`;
  }

  function fieldErrorCls(row,field){ return row?.__fieldErrors?.[field]?'is-invalid':''; }
  function compactField(module,field,inputHtml,hint='',required=false,wide=false){
    const tip=getFieldTooltip(module,field);
    return `<div class="smart-field ${wide?'wide':''}"><label>${escapeHtml(field)}${required?'<span class="required">*</span>':''}${tip?tooltipIcon(tip):''}</label>${inputHtml}<small>${escapeHtml(hint||tip||'')}</small></div>`;
  }
  function smartSection(icon,title,body,extra=''){
    return `<section class="smart-section"><div class="smart-section-head"><div><span class="material-symbols-rounded">${icon}</span><strong>${escapeHtml(title)}</strong></div>${extra}</div>${body}</section>`;
  }
  function smartToolbar(){
    return `<div class="smart-toolbar"><button class="btn btn-sm" data-action="wizard-add-one"><span class="material-symbols-rounded">add</span>Thêm 1 bản ghi</button><button class="btn btn-sm" data-action="wizard-add-five"><span class="material-symbols-rounded">playlist_add</span>Thêm 5 bản ghi</button><button class="btn btn-sm" data-action="wizard-remove-empty"><span class="material-symbols-rounded">delete_sweep</span>Xóa bản ghi trống</button><button class="btn btn-sm" data-action="wizard-collapse"><span class="material-symbols-rounded">unfold_less</span>Thu gọn tất cả</button><button class="btn btn-sm" data-action="wizard-expand"><span class="material-symbols-rounded">unfold_more</span>Mở rộng tất cả</button></div>`;
  }

  /* ---------- Task wizard: replaces wide broken table by compact cards ---------- */
  renderTaskWizard = function(){
    const w=APP.state.wizard;if(!w)return;
    const title=w.mode==='edit'?'Cập nhật công việc':'Giao công việc';
    const body=w.step===1?renderTaskWizardEntry():renderTaskWizardReview();
    const footer=w.step===1?`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="wizard-next">Tiếp tục <span class="material-symbols-rounded">arrow_forward</span></button>`:`<button class="btn" data-action="wizard-back"><span class="material-symbols-rounded">arrow_back</span>Quay lại</button><button class="btn btn-primary" data-action="wizard-save"><span class="material-symbols-rounded">save</span>${w.mode==='edit'?'Lưu thay đổi':'Lưu công việc'}</button>`;
    openModal(wizardShell(title,w.mode==='edit'?'Cập nhật một công việc và kiểm tra trước khi lưu.':'Nhập một hoặc nhiều công việc theo dạng thẻ. Mỗi thẻ có thể mở rộng để nhập mô tả, kết quả, người tham gia và file.',w.step,2,body,footer,'smart-xwide'));
  };

  renderTaskWizardEntry = function(){
    const w=APP.state.wizard;
    const toolbar=w.mode==='create'?smartToolbar():'';
    return `<div class="smart-wizard smart-task-wizard">${toolbar}<div class="smart-record-list">${w.rows.map((r,i)=>smartTaskRowCard(r,i,{hideProject:false})).join('')}</div><div class="smart-note"><span class="material-symbols-rounded">tips_and_updates</span>Các trường dài được đưa vào phần mở rộng của từng thẻ để không làm vỡ layout. Bấm mũi tên để thu gọn/mở rộng từng dòng.</div></div>`;
  };

  function smartTaskRowCard(r,i,opts={}){
    const invalid=(r.__errors||[]).length;
    const fileCount=(r.__files||[]).length;
    const peopleCount=(r.__participants||[]).length;
    const hideProject=!!opts.hideProject;
    const summary=[hideProject?'Dự án sẽ lấy từ bước trước':(projectName(r['Mã dự án'])||'Chưa chọn dự án'), employeeName(r['Mã người phụ trách'])||'Chưa chọn phụ trách', r['Hạn hoàn thành']?('Hạn '+formatDate(r['Hạn hoàn thành'])):'Chưa chọn hạn'].join(' · ');
    return `<article class="smart-record-card ${invalid?'has-error':''}"><div class="smart-record-head"><div class="smart-row-index ${invalid?'bad':'ok'}">${i+1}</div><div class="smart-record-title"><strong>${escapeHtml(r['Tên công việc']||'Công việc chưa đặt tên')}</strong><small>${escapeHtml(summary)}</small></div><div class="smart-record-status">${invalid?statusBadge('Cần sửa'):statusBadge('Đang nhập')}</div><div class="row-actions"><button class="row-action" data-action="wizard-toggle-row" data-tempid="${r.__tempId}" title="Thu gọn / mở rộng"><span class="material-symbols-rounded">${r.__expanded?'expand_less':'expand_more'}</span></button>${APP.state.wizard?.mode==='create'?`<button class="row-action" data-action="wizard-duplicate-row" data-tempid="${r.__tempId}" title="Nhân bản"><span class="material-symbols-rounded">content_copy</span></button><button class="row-action danger" data-action="wizard-remove-row" data-tempid="${r.__tempId}" title="Xóa dòng"><span class="material-symbols-rounded">delete</span></button>`:''}</div></div>
      <div class="smart-row-grid ${hideProject?'no-project':''}">
        ${compactField('tasks','Tên công việc',`<input class="${fieldErrorCls(r,'Tên công việc')}" data-wizard-field="Tên công việc" data-tempid="${r.__tempId}" value="${escapeAttr(r['Tên công việc'])}" placeholder="Nhập công việc cụ thể cần giao">`,'Cụ thể, có đầu ra kiểm tra được.',true,true)}
        ${hideProject?'':compactField('tasks','Mã dự án',wizardCombo(r,'Mã dự án',projectOptions(),'Tìm dự án...'),'Dự án dùng để tổng hợp tiến độ.',true)}
        ${compactField('tasks','Nhóm công việc',wizardCombo(r,'Nhóm công việc',categoryOptions('Nhóm công việc'),'Tìm nhóm...'),'Phân loại công việc.',true)}
        ${compactField('tasks','Mã người phụ trách',wizardCombo(r,'Mã người phụ trách',personOptions(),'Tìm nhân sự...'),'Người chịu trách nhiệm chính.',true)}
        ${compactField('tasks','Ngày bắt đầu',`<input type="date" data-wizard-field="Ngày bắt đầu" data-tempid="${r.__tempId}" value="${escapeAttr(r['Ngày bắt đầu'])}">`,'Ngày bắt đầu thực hiện.',true)}
        ${compactField('tasks','Hạn hoàn thành',`<input class="${fieldErrorCls(r,'Hạn hoàn thành')}" type="date" data-wizard-field="Hạn hoàn thành" data-tempid="${r.__tempId}" value="${escapeAttr(r['Hạn hoàn thành'])}">`,'Dùng để cảnh báo quá hạn.',true)}
        ${compactField('tasks','Mức độ ưu tiên',wizardCombo(r,'Mức độ ưu tiên',fixedOptions('priority'),'Chọn ưu tiên'),'Sắp xếp ưu tiên xử lý.',true)}
        ${compactField('tasks','Trạng thái',wizardCombo(r,'Trạng thái',fixedOptions('taskStatus'),'Chọn trạng thái'),'Luồng xác nhận công việc.',true)}
        ${compactField('tasks','Tiến độ (%)',`<input type="number" min="0" max="100" data-wizard-field="Tiến độ (%)" data-tempid="${r.__tempId}" value="${escapeAttr(r['Tiến độ (%)']??0)}">`,'0 đến 100%.')}
        <div class="smart-file-box"><button class="btn btn-sm" data-action="wizard-file-trigger" data-tempid="${r.__tempId}"><span class="material-symbols-rounded">attach_file</span>${fileCount?fileCount+' file':'Chọn file'}</button><input class="hidden" type="file" multiple data-wizard-file="${r.__tempId}"><small>${fileCount?'Có file đính kèm':'Ảnh, PDF, chứng từ liên quan.'}</small></div>
      </div>
      ${r.__expanded?`<div class="smart-row-expand"><div class="smart-row-grid detail-grid"><div class="smart-field wide"><label>Người tham gia ${tooltipIcon('Chọn người phối hợp. KPI chính không tính toàn bộ cho người tham gia.')}</label>${multiPersonPicker('wizard-part-'+r.__tempId,r.__participants,'Chọn người phối hợp. KPI chính không tính toàn bộ cho người tham gia.')}</div>${compactField('tasks','Mô tả',`<textarea data-wizard-field="Mô tả" data-tempid="${r.__tempId}" placeholder="Mô tả yêu cầu, phạm vi, lưu ý cần thực hiện...">${escapeHtml(r['Mô tả']||'')}</textarea>`,'Nội dung giao việc.',false,true)}${compactField('tasks','Kết quả',`<textarea data-wizard-field="Kết quả" data-tempid="${r.__tempId}" placeholder="Nhập kết quả hoặc để trống khi chưa hoàn thành...">${escapeHtml(r['Kết quả']||'')}</textarea>`,'Kết quả đầu ra khi hoàn thành.',false,true)}</div><div class="smart-file-list"><strong>File đã chọn</strong><div class="pending-files">${fileCount?r.__files.map((f,fi)=>`<div class="file-chip"><div class="file-chip-icon"><span class="material-symbols-rounded">${fileIcon(f.type)}</span></div><div><strong>${escapeHtml(f.name)}</strong><small>${formatFileSize(f.size)}</small></div><div class="file-chip-actions"><button class="row-action danger" data-action="wizard-remove-file" data-tempid="${r.__tempId}" data-fileindex="${fi}"><span class="material-symbols-rounded">close</span></button></div></div>`).join(''):'<span class="muted">Chưa chọn file.</span>'}</div></div>${invalid?`<div class="wizard-error-summary">${r.__errors.map(x=>escapeHtml(x)).join('<br>')}</div>`:''}</div>`:''}
    </article>`;
  }

  syncWizardParticipants = function(){
    const w=APP.state.wizard;if(!w)return;
    w.rows.forEach(r=>{
      const key='wizard-part-'+r.__tempId;
      if(document.querySelector(`[data-multi-options="${CSS.escape(key)}"]`)){
        r.__participants=getCheckedPeople(key).filter(x=>x!==r['Mã người phụ trách']);
      }
    });
  };

  renderTaskWizardReview = function(){
    const w=APP.state.wizard;validateWizardRows();
    const totalErr=w.rows.reduce((s,r)=>s+(r.__errors||[]).length,0);
    return `<div class="smart-review"><div class="smart-review-head"><div><h2>Kiểm tra trước khi lưu</h2><p>${w.rows.length} công việc · ${w.rows.reduce((s,r)=>s+(r.__files||[]).length,0)} file · ${w.rows.reduce((s,r)=>s+(r.__participants||[]).length,0)} người tham gia</p></div><span class="badge ${totalErr?'badge-red':'badge-green'}">${totalErr?totalErr+' lỗi cần sửa':'Dữ liệu hợp lệ'}</span></div><div class="smart-review-list">${w.rows.map((r,i)=>`<div class="smart-review-item ${r.__errors?.length?'bad':'ok'}"><div class="smart-row-index ${r.__errors?.length?'bad':'ok'}">${i+1}</div><div><strong>${escapeHtml(r['Tên công việc']||'Chưa nhập tên')}</strong><p>${escapeHtml(projectName(r['Mã dự án'])||'')} · ${escapeHtml(employeeName(r['Mã người phụ trách'])||'')} · Hạn ${formatDate(r['Hạn hoàn thành'])} · ${r.__participants.length} người tham gia · ${r.__files.length} file</p>${r.__errors?.length?`<div class="wizard-error-summary">${r.__errors.map(e=>escapeHtml(e)).join('<br>')}</div>`:''}</div><div>${r.__errors?.length?statusBadge('Cần sửa'):statusBadge('Hợp lệ')}</div></div>`).join('')}</div></div>`;
  };

  /* ---------- Generic two-step form wizards ---------- */
  function startFormWizard(kind,id='',initial={}){
    APP.state.pendingFiles=[];
    APP.state.formWizard={kind,id,step:1,draft:Object.assign({},initial),members:[],title:'',subtitle:''};
    if(kind==='project'){
      const memberRows=id?(APP.data.projectMembers||[]).filter(m=>m['Mã dự án']===id):[];
      APP.state.formWizard.members=memberRows.map(m=>m['Mã nhân sự']);
    }
    if(kind==='kpiTemplate'){
      const details=id?(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===id).map(d=>Object.assign({},d)):[];
      APP.state.templateDraftDetails=details.length?details:[newTemplateDetail()];
    }
    renderFormWizard();
  }

  function openProjectWizard(id=''){
    const r=id?(APP.data.projects||[]).find(x=>x['Mã dự án']===id):{};
    startFormWizard('project',id,r||{});
  }
  function openEmployeeWizard(id=''){
    const r=id?(APP.data.employees||[]).find(x=>x['Mã nhân sự']===id):{};
    startFormWizard('employee',id,r||{});
  }
  function openUserWizard(id=''){
    const r=id?(APP.data.users||[]).find(x=>x['Mã người dùng']===id):{};
    startFormWizard('user',id,r||{});
  }
  function openKpiTemplateWizard(id=''){
    const r=id?(APP.data.kpiTemplates||[]).find(x=>x['Mã mẫu KPI']===id):{};
    startFormWizard('kpiTemplate',id,r||{});
  }
  function openCreateKpiWizard(){
    startFormWizard('createKpi','',{'Kỳ':formatPeriod(startOfMonth(new Date()))});
  }
  function openUploadWizard(){
    startFormWizard('upload','',{});
  }

  function formWizardMeta(kind,id){
    const meta={
      project:[id?'Cập nhật dự án':'Thêm dự án','Thiết lập dự án, người phụ trách, thành viên và tài liệu liên quan.','Lưu dự án'],
      employee:[id?'Cập nhật nhân sự':'Thêm nhân sự','Nhập hồ sơ nhân sự với các trường liên kết dạng tìm kiếm và chọn.','Lưu nhân sự'],
      user:[id?'Cập nhật người dùng':'Thêm người dùng','Thiết lập tài khoản, vai trò và phạm vi dữ liệu.','Lưu tài khoản'],
      kpiTemplate:[id?'Cập nhật mẫu KPI':'Thêm mẫu KPI','Thiết lập mẫu KPI và kiểm tra trọng số trước khi lưu.','Lưu mẫu KPI'],
      createKpi:['Tạo KPI tháng','Chọn nhân sự, mẫu KPI và kỳ áp dụng.','Tạo KPI'],
      upload:['Upload tài liệu','Chọn hồ sơ liên kết, loại tài liệu và file cần upload.','Upload']
    };
    return meta[kind]||['Biểu mẫu','Nhập và kiểm tra thông tin.','Lưu'];
  }

  function renderFormWizard(){
    const w=APP.state.formWizard;if(!w)return;
    const [title,subtitle,saveText]=formWizardMeta(w.kind,w.id);
    let body=w.step===1?formWizardEntryBody(w):formWizardReviewBody(w);
    const footer=w.step===1?`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="smart-next">Tiếp tục <span class="material-symbols-rounded">arrow_forward</span></button>`:`<button class="btn" data-action="smart-back"><span class="material-symbols-rounded">arrow_back</span>Quay lại</button><button class="btn btn-primary" data-action="smart-save"><span class="material-symbols-rounded">save</span>${saveText}</button>`;
    openModal(wizardShell(title,subtitle,w.step,2,body,footer,w.kind==='createKpi'?'smart-small':'smart-wide',['Nhập thông tin','Kiểm tra thông tin']));
  }

  function formWizardEntryBody(w){
    if(w.kind==='project') return projectEntry(w);
    if(w.kind==='employee') return employeeEntry(w);
    if(w.kind==='user') return userEntry(w);
    if(w.kind==='kpiTemplate') return templateEntry(w);
    if(w.kind==='createKpi') return createKpiEntry(w);
    if(w.kind==='upload') return uploadEntry(w);
    return '';
  }

  function projectEntry(w){const r=w.draft||{};return `<div class="smart-form smart-form-project">${smartSection('folder_open','Thông tin dự án',`<div class="smart-form-grid cols-3">${w.id?compactField('projects','Mã dự án',textInput('Mã dự án',r['Mã dự án'],'Tự sinh','text','readonly'),'Mã hệ thống.'):''}${compactField('projects','Tên dự án',textInput('Tên dự án',r['Tên dự án'],'Nhập tên dự án nội bộ'),'Tên ngắn gọn, dễ nhận biết.',true,true)}${compactField('projects','Loại dự án',comboHtml('Loại dự án',r['Loại dự án'],categoryOptions('Loại dự án'),'Tìm loại dự án...'),'Lấy từ Danh mục.',true)}${compactField('projects','Mã người phụ trách',comboHtml('Mã người phụ trách',r['Mã người phụ trách'],personOptions(),'Tìm mã hoặc tên nhân sự...'),'Một người chịu trách nhiệm chính.',true)}${compactField('projects','Ngày bắt đầu',textInput('Ngày bắt đầu',toDateInput(r['Ngày bắt đầu']),'','date'),'Ngày bắt đầu kế hoạch.',true)}${compactField('projects','Ngày dự kiến kết thúc',textInput('Ngày dự kiến kết thúc',toDateInput(r['Ngày dự kiến kết thúc']),'','date'),'Phải từ ngày bắt đầu trở đi.',true)}${compactField('projects','Trạng thái',comboHtml('Trạng thái',r['Trạng thái']||'Chưa bắt đầu',fixedOptions('projectStatus'),'Chọn trạng thái'),'Trạng thái cố định phục vụ báo cáo.',true)}${compactField('projects','Mức độ ưu tiên',comboHtml('Mức độ ưu tiên',r['Mức độ ưu tiên']||'Bình thường',fixedOptions('priority'),'Chọn mức độ'),'Dùng để cảnh báo.',true)}${compactField('projects','Tiến độ (%)',textInput('Tiến độ (%)',r['Tiến độ (%)']??0,'Tự tính','number','readonly'),'Tự tính từ công việc.')}${compactField('projects','Mô tả',textArea('Mô tả',r['Mô tả'],'Mô tả mục tiêu, phạm vi, kết quả mong đợi...'),'Mô tả nghiệp vụ của dự án.',false,true)}${compactField('projects','Ghi chú',textArea('Ghi chú',r['Ghi chú'],'Thông tin bổ sung...'),'Thông tin bổ sung.',false,true)}</div>`)}${smartSection('groups','Thành viên tham gia',multiPersonPicker('project-members',w.members||[],'Người phụ trách chính không cần chọn lại ở đây.'))}${smartSection('attach_file','Tài liệu đính kèm',uploadZoneHtml('Tài liệu dự án sẽ upload sau khi bấm Lưu dự án.'))}</div>`;}

  function employeeEntry(w){const r=w.draft||{};return `<div class="smart-form"><div class="smart-form-grid cols-2">${w.id?compactField('employees','Mã nhân sự',textInput('Mã nhân sự',r['Mã nhân sự'],'Tự sinh','text','readonly'),'Mã hệ thống.'):''}${compactField('employees','Họ và tên',textInput('Họ và tên',r['Họ và tên'],'Ví dụ: Nguyễn Văn An'),'Tên hiển thị trong toàn hệ thống.',true,true)}${compactField('employees','Nhóm',comboHtml('Nhóm',r['Nhóm'],categoryOptions('Nhóm'),'Tìm Nhóm...'),'Lấy từ Danh mục.',true)}${compactField('employees','Chức vụ',comboHtml('Chức vụ',r['Chức vụ'],categoryOptions('Chức vụ'),'Tìm chức vụ...'),'Lấy từ Danh mục.',true)}${compactField('employees','Mã quản lý trực tiếp',comboHtml('Mã quản lý trực tiếp',r['Mã quản lý trực tiếp'],personOptions(e=>e['Mã nhân sự']!==w.id),'Tìm quản lý...'),'Xác định đội nhóm và quyền đánh giá KPI.')}${compactField('employees','Email',textInput('Email',r['Email'],'ten@congty.vn','email'),'Email đúng định dạng.')}${compactField('employees','Số điện thoại',textInput('Số điện thoại',formatPhoneRaw(r['Số điện thoại']),'0901234567','text','inputmode="numeric"'),'Giữ nguyên số 0 đầu.')}${compactField('employees','Ngày tháng năm sinh',textInput('Ngày tháng năm sinh',toDateInput(r['Ngày tháng năm sinh']),'','date'),'Ngày bắt đầu làm việc.')}${compactField('employees','Trạng thái',comboHtml('Trạng thái',r['Trạng thái']||'Đang làm',['Đang làm','Tạm nghỉ','Đã nghỉ'],'Chọn trạng thái'),'Trạng thái nhân sự hiện tại.',true)}${compactField('employees','Ghi chú',textArea('Ghi chú',r['Ghi chú'],'Thông tin bổ sung...'),'Không ảnh hưởng báo cáo.',false,true)}</div></div>`;}

  function userEntry(w){const r=w.draft||{},role=r['Vai trò']||'Nhóm';return `<div class="smart-form"><div class="smart-form-grid cols-2">${w.id?compactField('users','Mã người dùng',textInput('Mã người dùng',r['Mã người dùng'],'Tự sinh','text','readonly'),'Mã hệ thống.'):''}${compactField('users','Tên đăng nhập',textInput('Tên đăng nhập',r['Tên đăng nhập'],'Ví dụ: nguyenvana'),'Không dùng khoảng trắng và không trùng tài khoản khác.',true)}${compactField('users','Mật khẩu',textInput('Mật khẩu','',w.id?'Để trống để giữ mật khẩu hiện tại':'Nhập mật khẩu','password'),w.id?'Chỉ nhập khi cần đổi mật khẩu.':'Tài khoản mới bắt buộc có mật khẩu.',!w.id)}${compactField('users','Vai trò',comboHtml('Vai trò',role,fixedOptions('userRole'),'Chọn vai trò'),'Quyết định chức năng được phép dùng.',true)}${compactField('users','Mã nhân sự',comboHtml('Mã nhân sự',r['Mã nhân sự'],personOptions(),'Tìm nhân sự...'),'Liên kết tài khoản với hồ sơ nhân sự.',true)}${compactField('users','Phạm vi dữ liệu',textInput('Phạm vi dữ liệu',r['Phạm vi dữ liệu']||roleScope(role),'Tự động theo vai trò','text','readonly'),'Toàn công ty cho Quản trị, Đội nhóm cho Quản lý, Cá nhân cho Nhóm.',true)}${compactField('users','Trạng thái',comboHtml('Trạng thái',r['Trạng thái']||'Hoạt động',fixedOptions('userStatus'),'Chọn trạng thái'),'Tạm khóa sẽ ngăn đăng nhập.',true)}${compactField('users','Ghi chú',textArea('Ghi chú',r['Ghi chú'],'Ghi chú tài khoản...'),'Thông tin nội bộ.',false,true)}</div></div>`;}

  function templateEntry(w){const r=w.draft||{};const weight=(APP.state.templateDraftDetails||[]).reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0);const rows=(APP.state.templateDraftDetails||[]).map((d,i)=>`<article class="smart-detail-card"><div class="smart-detail-head"><strong>Chỉ tiêu ${i+1}</strong><button class="row-action danger" data-action="template-remove-detail" data-index="${i}"><span class="material-symbols-rounded">delete</span></button></div><div class="smart-form-grid cols-6">${compactTemplateInput(i,'Tên chỉ tiêu',d['Tên chỉ tiêu'],'Tên chỉ tiêu')}${compactTemplateSelect(i,'Nhóm KPI',d['Nhóm KPI'],APP.data.categories?.['Nhóm KPI']||[])}${compactTemplateInput(i,'Đơn vị tính',d['Đơn vị tính'],'% / Điểm')}${compactTemplateInput(i,'Mục tiêu mặc định',d['Mục tiêu mặc định'],'100','number')}${compactTemplateInput(i,'Trọng số (%)',d['Trọng số (%)'],'20','number')}${compactTemplateSelect(i,'Cách ghi nhận',d['Cách ghi nhận'],APP.data.fixedOptions?.dataCapture||[])}</div></article>`).join('');return `<div class="smart-form">${smartSection('description','Thông tin mẫu',`<div class="smart-form-grid cols-3">${w.id?compactField('kpiTemplates','Mã mẫu KPI',textInput('Mã mẫu KPI',r['Mã mẫu KPI'],'Tự sinh','text','readonly'),'Mã hệ thống.'):''}${compactField('kpiTemplates','Tên mẫu KPI',textInput('Tên mẫu KPI',r['Tên mẫu KPI'],'Ví dụ: KPI Marketing'),'Tên bộ KPI.',true)}${compactField('kpiTemplates','Phạm vi áp dụng',comboHtml('Phạm vi áp dụng',r['Phạm vi áp dụng']||'Nhóm',['Nhóm','Chức vụ','Nhân sự'],'Chọn phạm vi'),'Chọn đối tượng áp dụng.',true)}${compactField('kpiTemplates','Giá trị áp dụng',textInput('Giá trị áp dụng',r['Giá trị áp dụng'],'Ví dụ: Marketing'),'Tên Nhóm/chức vụ hoặc mã nhân sự.',true)}${compactField('kpiTemplates','Trạng thái',comboHtml('Trạng thái',r['Trạng thái']||'Đang áp dụng',fixedOptions('templateStatus'),'Chọn trạng thái'),'Mẫu đang áp dụng mới dùng cho kỳ mới.',true)}${compactField('kpiTemplates','Ngày hiệu lực',textInput('Ngày hiệu lực',toDateInput(r['Ngày hiệu lực']||new Date()),'','date'),'Ngày bắt đầu áp dụng.')}${compactField('kpiTemplates','Mô tả',textArea('Mô tả',r['Mô tả'],'Mô tả mục tiêu bộ KPI...'),'Mô tả ngắn.',false,true)}</div>`)}${smartSection('format_list_bulleted','Chỉ tiêu KPI',`<div class="smart-section-actions"><span class="badge ${Math.round(weight)===100?'badge-green':'badge-red'}">Tổng trọng số: ${round1(weight)}%</span><button class="btn btn-sm" data-action="template-add-detail"><span class="material-symbols-rounded">add</span>Thêm chỉ tiêu</button></div><div class="smart-detail-list">${rows}</div><div class="field-help">Tổng trọng số các chỉ tiêu đang áp dụng phải bằng 100%. Điểm mỗi chỉ tiêu tối đa 120.</div>`)}</div>`;}
  function compactTemplateInput(i,field,value,placeholder,type='text'){return `<div class="smart-field"><label>${escapeHtml(field)}</label><input type="${type}" data-template-index="${i}" data-template-field="${escapeAttr(field)}" value="${escapeAttr(value??'')}" placeholder="${escapeAttr(placeholder)}"></div>`;}
  function compactTemplateSelect(i,field,value,options){return `<div class="smart-field"><label>${escapeHtml(field)}</label><select data-template-index="${i}" data-template-field="${escapeAttr(field)}">${(options||[]).map(o=>`<option value="${escapeAttr(o)}" ${o===value?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select></div>`;}

  function createKpiEntry(w){const r=w.draft||{};return `<div class="smart-form"><div class="smart-form-grid cols-2">${compactField('kpiMonths','Mã nhân sự',comboHtml('Mã nhân sự',r['Mã nhân sự'],personOptions(),'Tìm mã hoặc tên nhân sự...'),'Chọn nhân sự chưa có KPI trong kỳ.',true)}${compactField('kpiMonths','Mã mẫu KPI',comboHtml('Mã mẫu KPI',r['Mã mẫu KPI'],(APP.data.kpiTemplates||[]).filter(t=>t['Trạng thái']==='Đang áp dụng').map(t=>({value:t['Mã mẫu KPI'],label:`${t['Mã mẫu KPI']} - ${t['Tên mẫu KPI']}`})),'Tìm mẫu KPI...'),'Chọn bộ KPI đang áp dụng.',true)}${compactField('kpiMonths','Kỳ',textInput('Kỳ',r['Kỳ']||formatPeriod(startOfMonth(new Date())),'MM/YYYY','text'),'Nhập kỳ theo định dạng MM/YYYY.',true)}</div></div>`;}
  function uploadEntry(w){const r=w.draft||{};return `<div class="smart-form"><div class="smart-form-grid cols-2">${compactField('files','Module liên quan',comboHtml('Module liên quan',r['Module liên quan'],['Dự án','Công việc','KPI tháng'],'Chọn module'),'Chọn module hồ sơ cần liên kết.',true)}${compactField('files','Mã bản ghi liên quan',comboHtml('Mã bản ghi liên quan',r['Mã bản ghi liên quan'],uploadRecordOptions(),'Tìm mã hoặc tên hồ sơ...'),'Chọn đúng hồ sơ thuộc module đã chọn.',true)}${compactField('files','Loại tài liệu',comboHtml('Loại tài liệu',r['Loại tài liệu'],categoryOptions('Loại tài liệu'),'Tìm loại tài liệu...'),'Lấy từ Danh mục.',true)}${compactField('files','Ghi chú',textInput('Ghi chú',r['Ghi chú'],'Ghi chú tài liệu'),'Không bắt buộc.')}${compactField('files','File',uploadZoneHtml('Có thể chọn nhiều file. File chưa được gửi lên Drive ở bước này.'),'Kiểm tra tên, loại và dung lượng trước khi upload.',true,true)}</div></div>`;}

  function smartSyncDraft(){
    const w=APP.state.formWizard;if(!w)return;
    if(w.kind==='kpiTemplate') syncTemplateDraftFromDom();
    w.draft=collectForm();
    if(w.kind==='project') w.members=getCheckedPeople('project-members');
  }
  function smartValidateDraft(){
    const w=APP.state.formWizard;smartSyncDraft();
    const f=w.draft||{};const errors=[];
    const req={project:['Tên dự án','Loại dự án','Mã người phụ trách','Ngày bắt đầu','Ngày dự kiến kết thúc','Trạng thái','Mức độ ưu tiên'],employee:['Họ và tên','Nhóm','Chức vụ','Trạng thái'],user:['Tên đăng nhập','Vai trò','Mã nhân sự','Phạm vi dữ liệu','Trạng thái'],kpiTemplate:['Tên mẫu KPI','Phạm vi áp dụng','Giá trị áp dụng','Trạng thái'],createKpi:['Mã nhân sự','Mã mẫu KPI','Kỳ'],upload:['Module liên quan','Mã bản ghi liên quan','Loại tài liệu']}[w.kind]||[];
    req.forEach(x=>{if(!String(f[x]||'').trim()) errors.push('Thiếu '+x);});
    if(w.kind==='project'&&parseDate(f['Ngày dự kiến kết thúc'])&&parseDate(f['Ngày bắt đầu'])&&parseDate(f['Ngày dự kiến kết thúc'])<parseDate(f['Ngày bắt đầu'])) errors.push('Ngày dự kiến kết thúc phải từ ngày bắt đầu trở đi.');
    if(w.kind==='employee'&&f['Email']&&!/^\S+@\S+\.\S+$/.test(String(f['Email']))) errors.push('Email không đúng định dạng.');
    if(w.kind==='user'&&!w.id&&!String(f['Mật khẩu']||'').trim()) errors.push('Tài khoản mới bắt buộc có mật khẩu.');
    if(w.kind==='upload'&&!APP.state.pendingFiles.length) errors.push('Chưa chọn file upload.');
    if(w.kind==='kpiTemplate'){
      const weight=(APP.state.templateDraftDetails||[]).reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0);
      if(Math.abs(weight-100)>.01) errors.push('Tổng trọng số chỉ tiêu phải bằng 100%.');
      (APP.state.templateDraftDetails||[]).forEach((d,i)=>{if(!String(d['Tên chỉ tiêu']||'').trim())errors.push('Chỉ tiêu '+(i+1)+' thiếu tên chỉ tiêu.');if(!String(d['Nhóm KPI']||'').trim())errors.push('Chỉ tiêu '+(i+1)+' thiếu nhóm KPI.');});
    }
    w.errors=errors;return errors;
  }
  function smartWizardNext(){const errors=smartValidateDraft();if(errors.length){showToast('Cần bổ sung thông tin',errors.slice(0,3).join(' · '),'warning',5500);renderFormWizard();return;}APP.state.formWizard.step=2;renderFormWizard();}
  function smartWizardBack(){APP.state.formWizard.step=1;renderFormWizard();}
  async function smartWizardSave(){const errors=smartValidateDraft();if(errors.length){APP.state.formWizard.step=1;renderFormWizard();showToast('Chưa thể lưu',errors.slice(0,4).join(' · '),'error',6500);return;}const w=APP.state.formWizard;const f=Object.assign({},w.draft);const [title,subtitle,saveText]=formWizardMeta(w.kind,w.id);const t=showToast('Đang xử lý',saveText+'...', 'processing',0);try{
      if(w.kind==='project'){
        const res=await gas('saveRecord','projects',f,APP.token,{timeout:60000});mergeDataResult(res);const id=res.id||f['Mã dự án'];const members=(w.members||[]).filter(x=>x!==f['Mã người phụ trách']).map(employeeId=>({employeeId,role:'Thành viên',joinDate:f['Ngày bắt đầu'],status:f['Trạng thái']==='Hoàn thành'?'Đã kết thúc':'Đang tham gia'}));const r2=await gas('saveProjectMembers',id,members,APP.token,{timeout:60000});mergeDataResult(r2);if(APP.state.pendingFiles.length) await uploadPendingFiles('Dự án',id);
      }else if(w.kind==='employee'){
        if(f['Số điện thoại']) f['Số điện thoại']=String(f['Số điện thoại']).replace(/\D/g,''); const res=await gas('saveRecord','employees',f,APP.token,{timeout:60000});mergeDataResult(res);
      }else if(w.kind==='user'){
        const res=await gas('saveRecord','users',f,APP.token,{timeout:60000});mergeDataResult(res);
      }else if(w.kind==='createKpi'){
        const res=await gas('createKpiMonth',f['Mã nhân sự'],f['Mã mẫu KPI'],f['Kỳ'],APP.token,{timeout:90000});mergeDataResult(res);
      }else if(w.kind==='upload'){
        for(let i=0;i<APP.state.pendingFiles.length;i++){updateToast(t,'Đang upload file',`${i+1}/${APP.state.pendingFiles.length}: ${APP.state.pendingFiles[i].name}`,'processing',0);await uploadOneFile(APP.state.pendingFiles[i],f['Module liên quan'],f['Mã bản ghi liên quan'],f['Loại tài liệu'],f['Ghi chú']);}
      }else if(w.kind==='kpiTemplate'){
        const res=await gas('saveRecord','kpiTemplates',f,APP.token,{timeout:60000});mergeDataResult(res);const templateId=res.id||f['Mã mẫu KPI'];const old=(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===templateId);const kept=new Set((APP.state.templateDraftDetails||[]).map(d=>d['Mã chỉ tiêu mẫu']).filter(Boolean));for(const o of old){if(!kept.has(o['Mã chỉ tiêu mẫu'])){const rr=await gas('deleteRecord','kpiTemplateDetails',o['Mã chỉ tiêu mẫu'],APP.token,{timeout:45000});mergeDataResult(rr);}}for(const d of APP.state.templateDraftDetails||[]){d['Mã mẫu KPI']=templateId;d['Điểm tối đa']=120;d['Chiều đánh giá']=d['Chiều đánh giá']||'Càng cao càng tốt';d['Trạng thái']=d['Trạng thái']||'Đang áp dụng';const rr=await gas('saveRecord','kpiTemplateDetails',d,APP.token,{timeout:45000});mergeDataResult(rr);}
      }
      closeModal();updateToast(t,'Đã lưu thành công','Dữ liệu đã được kiểm tra và cập nhật.','success',3800);renderCurrentPage();
    }catch(err){updateToast(t,'Không thể lưu',err.message,'error',6500);}}

  function formWizardReviewBody(w){
    smartSyncDraft();const f=w.draft||{};const errors=smartValidateDraft();
    let rows=[];Object.entries(f).forEach(([k,v])=>{if(k&&String(v||'').trim())rows.push([k,v]);});
    let extra='';
    if(w.kind==='project') extra=`<div class="smart-review-extra"><b>Thành viên:</b> ${(w.members||[]).map(employeeName).filter(Boolean).join(', ')||'Chưa chọn'}<br><b>File:</b> ${APP.state.pendingFiles.length} file</div>`;
    if(w.kind==='upload') extra=`<div class="smart-review-extra"><b>File sẽ upload:</b> ${APP.state.pendingFiles.map(f=>escapeHtml(f.name)).join(', ')}</div>`;
    if(w.kind==='kpiTemplate') extra=`<div class="smart-review-extra"><b>Chỉ tiêu KPI:</b> ${(APP.state.templateDraftDetails||[]).length} chỉ tiêu · Tổng trọng số ${(APP.state.templateDraftDetails||[]).reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0)}%</div>`;
    return `<div class="smart-review"><div class="smart-review-head"><div><h2>Kiểm tra thông tin trước khi lưu</h2><p>Đối chiếu nhanh dữ liệu, lỗi định dạng và dữ liệu liên kết.</p></div><span class="badge ${errors.length?'badge-red':'badge-green'}">${errors.length?errors.length+' lỗi cần sửa':'Dữ liệu hợp lệ'}</span></div>${errors.length?`<div class="wizard-error-summary">${errors.map(e=>escapeHtml(e)).join('<br>')}</div>`:''}<div class="smart-review-grid">${rows.map(([k,v])=>`<div><small>${escapeHtml(k)}</small><strong>${escapeHtml(displayReviewValue(k,v))}</strong></div>`).join('')}</div>${extra}</div>`;
  }
  function displayReviewValue(k,v){ if(String(k).includes('Mã nhân sự')||String(k).includes('người phụ trách')) return employeeName(v)||v; if(String(k).includes('Mã dự án')) return projectName(v)||v; return v; }
  function smartTemplateAddDetail(){syncTemplateDraftFromDom();APP.state.templateDraftDetails.push(newTemplateDetail());renderFormWizard();}
  function smartTemplateRemoveDetail(i){syncTemplateDraftFromDom();APP.state.templateDraftDetails.splice(i,1);if(!APP.state.templateDraftDetails.length)APP.state.templateDraftDetails.push(newTemplateDetail());renderFormWizard();}






  /* ---------- PATCH 6: refined wizard CRUD popup UX ---------- */
  function wizardStepLabels(title,total,customLabels){
    if(Array.isArray(customLabels) && customLabels.length) return customLabels;
    if(total===3) return ['Nhập thông tin','Bổ sung thông tin','Kiểm tra thông tin'];
    if(String(title||'').toLowerCase().includes('công việc')) return ['Nhập thông tin','Kiểm tra thông tin'];
    return ['Nhập thông tin','Kiểm tra thông tin'];
  }
  wizardShell = function(title,subtitle,step,total,body,footer,size='smart-wide',customLabels){
    const labels=wizardStepLabels(title,total,customLabels);
    const steps = Array.from({length:total},(_,i)=>{
      const state = step===i+1?'active':step>i+1?'done':'';
      const tick = String(i+1);
      return `<div class="smart-step ${state}"><span>${tick}</span><b>${escapeHtml(labels[i]||('Bước '+(i+1)))}</b></div>`;
    }).join('');
    return `<div class="modal ${size} smart-modal refined-smart-modal"><div class="modal-head smart-modal-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle||'')}</p></div><button class="modal-close" data-action="close-modal"><span class="material-symbols-rounded">close</span></button></div><div class="smart-steps">${steps}</div><div class="modal-body smart-modal-body">${body}</div><div class="modal-footer smart-modal-footer"><div id="wizard-progress-text" class="smart-progress-text"></div>${footer}</div></div>`;
  };

  projectEntry = function(w){
    const r=w.draft||{};
    return `<div class="task-crud-layout flow-project-entry">
      <section class="smart-section flow-section">
        <div class="flow-section-title"><span class="material-symbols-rounded">folder_open</span><div><strong>Dự án cha</strong><small>Nhập nhanh hồ sơ dự án để liên kết ngay với các việc con ở bước tiếp theo.</small></div></div>
        <div class="smart-form-grid cols-3 flow-grid-project">
          ${w.id?compactField('projects','Mã dự án',textInput('Mã dự án',r['Mã dự án'],'Tự sinh','text','readonly'),'Mã hệ thống.'):''}
          ${compactField('projects','Tên dự án',textInput('Tên dự án',r['Tên dự án'],'Nhập tên dự án ngắn gọn và dễ hiểu'),'Tên ngắn gọn, dễ nhận biết.',true,true)}
          ${compactField('projects','Loại dự án',comboHtml('Loại dự án',r['Loại dự án'],categoryOptions('Loại dự án'),'Chọn loại dự án'),'Lấy từ Danh mục.',true)}
          ${compactField('projects','Mã người phụ trách',comboHtml('Mã người phụ trách',r['Mã người phụ trách'],personOptions(),'Tìm kiếm và chọn người phụ trách...'),'Một người chịu trách nhiệm chính.',true)}
          ${compactField('projects','Ngày bắt đầu',textInput('Ngày bắt đầu',toDateInput(r['Ngày bắt đầu']),'','date'),'Ngày bắt đầu kế hoạch.',true)}
          ${compactField('projects','Ngày dự kiến kết thúc',textInput('Ngày dự kiến kết thúc',toDateInput(r['Ngày dự kiến kết thúc']),'','date'),'Phải từ ngày bắt đầu trở đi.',true)}
          ${compactField('projects','Mức độ ưu tiên',comboHtml('Mức độ ưu tiên',r['Mức độ ưu tiên']||'Bình thường',fixedOptions('priority'),'Chọn mức độ ưu tiên'),'Dùng để cảnh báo.',true)}
          ${compactField('projects','Trạng thái',comboHtml('Trạng thái',r['Trạng thái']||'Chưa bắt đầu',fixedOptions('projectStatus'),'Chọn trạng thái'),'Trạng thái hiện tại của dự án.',true)}
          ${compactField('projects','Tiến độ (%)',textInput('Tiến độ (%)',r['Tiến độ (%)']??0,'Tự tính','number','readonly'),'Tự tính từ công việc.')}
          ${compactField('projects','Mô tả',textArea('Mô tả',r['Mô tả'],'Mô tả mục tiêu, phạm vi và đầu ra mong đợi của dự án...'),'Giúp mọi người hiểu rõ mục tiêu và phạm vi dự án.',false,true)}
        </div>
        <div class="flow-two-col">
          <div class="flow-side-card">
            <div class="flow-section-mini-title">Thành viên tham gia</div>
            ${multiPersonPicker('project-members',w.members||[],'Chọn các thành viên tham gia dự án.')}
          </div>
          <div class="flow-side-card">
            <div class="flow-section-mini-title">Tài liệu đính kèm</div>
            ${uploadZoneHtml('Kéo & thả hoặc chọn tài liệu liên quan đến dự án (tùy chọn).')}
          </div>
        </div>
      </section>
    </div>`;
  };

  renderTaskWizard = function(){
    const w=APP.state.wizard;if(!w)return;
    const title=w.mode==='edit'?'Cập nhật công việc':'Giao công việc';
    const body=w.step===1?renderTaskWizardEntry():renderTaskWizardReview();
    const footer=w.step===1
      ?`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="wizard-next">Tiếp tục <span class="material-symbols-rounded">arrow_forward</span></button>`
      :`<button class="btn" data-action="wizard-back"><span class="material-symbols-rounded">arrow_back</span>Quay lại</button><button class="btn btn-primary" data-action="wizard-save"><span class="material-symbols-rounded">save</span>${w.mode==='edit'?'Lưu thay đổi':'Lưu công việc'}</button>`;
    openModal(wizardShell(title,w.mode==='edit'?'Kiểm tra và cập nhật công việc theo cấu trúc popup wizard tinh gọn, dễ thao tác.':'Nhập một hoặc nhiều công việc theo dạng thẻ, dễ nhìn, không cắt ngắt chữ và thuận tiện khi giao việc.',w.step,2,body,footer,'smart-xwide',['Nhập thông tin','Kiểm tra thông tin']));
  };

  renderTaskWizardEntry = function(){
    const w=APP.state.wizard;
    const toolbar=w.mode==='create'?smartToolbar():'';
    const intro = `<div class="flow-hero compact"><div class="flow-hero-icon"><span class="material-symbols-rounded">task</span></div><div><strong>${w.mode==='edit'?'Cập nhật nội dung công việc':'Nhập danh sách công việc'}</strong><small>Trường quan trọng nằm ở phần đầu. Người tham gia, mô tả, kết quả và file được nhóm lại ở phần mở rộng để giao diện gọn hơn.</small></div></div>`;
    return `<div class="smart-wizard smart-task-wizard task-crud-layout">${intro}${toolbar}<div class="smart-record-list flow-record-list">${w.rows.map((r,i)=>smartTaskRowCard(r,i,{hideProject:false})).join('')}</div></div>`;
  };

  smartTaskRowCard = function(r,i,opts={}){
    const invalid=(r.__errors||[]).length;
    const fileCount=(r.__files||[]).length;
    const peopleCount=(r.__participants||[]).length;
    const hideProject=!!opts.hideProject;
    const summaryBits=[];
    if(!hideProject)summaryBits.push(projectName(r['Mã dự án'])||'Chưa chọn dự án');
    summaryBits.push(employeeName(r['Mã người phụ trách'])||'Chưa chọn phụ trách');
    if(r['Ngày bắt đầu'])summaryBits.push('BĐ '+formatDate(r['Ngày bắt đầu']));
    if(r['Hạn hoàn thành'])summaryBits.push('Hạn '+formatDate(r['Hạn hoàn thành']));
    const summary=summaryBits.join(' · ');
    const chips=`<div class="flow-card-chip-row">
      <span class="flow-mini-chip neutral">${peopleCount} người tham gia</span>
      <span class="flow-mini-chip neutral">${fileCount} file</span>
      <span class="flow-mini-chip ${invalid?'danger':'success'}">${invalid?'Cần sửa':'Đang nhập'}</span>
    </div>`;
    const expandedBody=`<div class="flow-task-body">
      <div class="flow-field-grid flow-grid-main ${hideProject?'hide-project':''}">
        ${compactField('tasks','Tên công việc',`<input class="${fieldErrorCls(r,'Tên công việc')}" data-wizard-field="Tên công việc" data-tempid="${r.__tempId}" value="${escapeAttr(r['Tên công việc'])}" placeholder="Nhập công việc cụ thể cần giao">`,'Cụ thể, có đầu ra kiểm tra được.',true,true)}
        ${hideProject?'':compactField('tasks','Mã dự án',wizardCombo(r,'Mã dự án',projectOptions(),'Tìm dự án...'),'Dự án dùng để tổng hợp tiến độ.',true)}
        ${compactField('tasks','Nhóm công việc',wizardCombo(r,'Nhóm công việc',categoryOptions('Nhóm công việc'),'Chọn nhóm...'),'Phân loại công việc.',true)}
        ${compactField('tasks','Mã người phụ trách',wizardCombo(r,'Mã người phụ trách',personOptions(),'Tìm nhân sự...'),'Người chịu trách nhiệm chính.',true)}
        ${compactField('tasks','Ngày bắt đầu',`<input type="date" data-wizard-field="Ngày bắt đầu" data-tempid="${r.__tempId}" value="${escapeAttr(r['Ngày bắt đầu'])}">`,'Ngày bắt đầu thực hiện.',true)}
        ${compactField('tasks','Hạn hoàn thành',`<input class="${fieldErrorCls(r,'Hạn hoàn thành')}" type="date" data-wizard-field="Hạn hoàn thành" data-tempid="${r.__tempId}" value="${escapeAttr(r['Hạn hoàn thành'])}">`,'Dùng để cảnh báo quá hạn.',true)}
        ${compactField('tasks','Mức độ ưu tiên',wizardCombo(r,'Mức độ ưu tiên',fixedOptions('priority'),'Chọn ưu tiên'),'Sắp xếp ưu tiên xử lý.',true)}
        ${compactField('tasks','Trạng thái',wizardCombo(r,'Trạng thái',fixedOptions('taskStatus'),'Chọn trạng thái'),'Luồng xác nhận công việc.',true)}
        ${compactField('tasks','Tiến độ (%)',`<div class="flow-stepper"><button type="button" class="stepper-btn" data-stepper="minus" data-target-tempid="${r.__tempId}" data-target-field="Tiến độ (%)">−</button><input type="number" min="0" max="100" data-wizard-field="Tiến độ (%)" data-tempid="${r.__tempId}" value="${escapeAttr(r['Tiến độ (%)']??0)}"><button type="button" class="stepper-btn" data-stepper="plus" data-target-tempid="${r.__tempId}" data-target-field="Tiến độ (%)">+</button></div>`,'0 đến 100%.')}
      </div>
      <div class="flow-split-grid">
        <div class="flow-side-card">
          <div class="flow-section-mini-title">Người tham gia ${tooltipIcon('Chọn người phối hợp. KPI chính không tính toàn bộ cho người tham gia.')}</div>
          ${multiPersonPicker('wizard-part-'+r.__tempId,r.__participants,'Chọn người phối hợp cho công việc này.')}
        </div>
        <div class="flow-side-card">
          <div class="flow-section-mini-title">Tài liệu</div>
          <div class="smart-file-box flow-upload-box"><button class="btn btn-sm" data-action="wizard-file-trigger" data-tempid="${r.__tempId}"><span class="material-symbols-rounded">upload_file</span>${fileCount?fileCount+' file đã chọn':'Chọn tệp'}</button><input class="hidden" type="file" multiple data-wizard-file="${r.__tempId}"><small>Hỗ trợ: PDF, DOCX, XLSX, PNG, JPG (tối đa 20MB/tệp)</small></div>
          <div class="pending-files compact">${fileCount?r.__files.map((f,fi)=>`<div class="file-chip"><div class="file-chip-icon"><span class="material-symbols-rounded">${fileIcon(f.type)}</span></div><div><strong>${escapeHtml(f.name)}</strong><small>${formatFileSize(f.size)}</small></div><div class="file-chip-actions"><button class="row-action danger" data-action="wizard-remove-file" data-tempid="${r.__tempId}" data-fileindex="${fi}"><span class="material-symbols-rounded">close</span></button></div></div>`).join(''):'<div class="empty-note">Chưa chọn file.</div>'}</div>
        </div>
      </div>
      <div class="flow-detail-grid">
        <div class="smart-field"><label>Mô tả ${tooltipIcon(getFieldTooltip('tasks','Mô tả')||'Mô tả yêu cầu và phạm vi thực hiện.')}</label><textarea data-wizard-field="Mô tả" data-tempid="${r.__tempId}" placeholder="Mô tả yêu cầu, phạm vi và lưu ý cần thực hiện...">${escapeHtml(r['Mô tả']||'')}</textarea><small>Nội dung giao việc.</small></div>
        <div class="smart-field"><label>Kết quả ${tooltipIcon(getFieldTooltip('tasks','Kết quả')||'Mô tả kết quả đầu ra khi hoàn thành.')}</label><textarea data-wizard-field="Kết quả" data-tempid="${r.__tempId}" placeholder="Nhập kết quả hoặc để trống khi chưa hoàn thành...">${escapeHtml(r['Kết quả']||'')}</textarea><small>Kết quả đầu ra khi hoàn thành.</small></div>
      </div>
      ${invalid?`<div class="wizard-error-summary">${r.__errors.map(x=>escapeHtml(x)).join('<br>')}</div>`:''}
    </div>`;
    const collapsedBody=invalid?`<div class="flow-task-body"><div class="wizard-error-summary compact">${r.__errors.map(x=>escapeHtml(x)).join('<br>')}</div></div>`:'';
    return `<article class="smart-record-card flow-task-card ${r.__expanded?'is-open':'is-collapsed'} ${invalid?'has-error':''}">
      <div class="smart-record-head flow-task-head">
        <div class="smart-row-index ${invalid?'bad':'ok'}">${i+1}</div>
        <div class="smart-record-title"><strong>${escapeHtml(r['Tên công việc']||'Công việc chưa đặt tên')}</strong><small>${escapeHtml(summary||'Nhập tên công việc, người phụ trách và hạn hoàn thành')}</small></div>
        <div class="smart-record-status">${chips}</div>
        <div class="row-actions"><button class="row-action" data-action="wizard-toggle-row" data-tempid="${r.__tempId}" title="Thu gọn / mở rộng toàn bộ bản ghi"><span class="material-symbols-rounded">${r.__expanded?'expand_less':'expand_more'}</span></button>${APP.state.wizard?.mode==='create'?`<button class="row-action" data-action="wizard-duplicate-row" data-tempid="${r.__tempId}" title="Nhân bản"><span class="material-symbols-rounded">content_copy</span></button><button class="row-action danger" data-action="wizard-remove-row" data-tempid="${r.__tempId}" title="Xóa dòng"><span class="material-symbols-rounded">delete</span></button>`:''}</div>
      </div>
      ${r.__expanded?expandedBody:collapsedBody}
    </article>`;
  };

  document.addEventListener('click', function(e){
    const stepper=e.target.closest('[data-stepper]');
    if(!stepper) return;
    const tempId=stepper.dataset.targetTempid, field=stepper.dataset.targetField;
    const input=document.querySelector(`[data-wizard-field="${field}"][data-tempid="${tempId}"]`);
    if(!input) return;
    let value=Number(input.value||0);
    value += stepper.dataset.stepper==='plus' ? 1 : -1;
    value=Math.min(100,Math.max(0,value));
    input.value=value;
    updateWizardInput(input);
  });

    function refreshSmartTemplateAfterInlineEdit(){ if(APP.state.formWizard?.kind==='kpiTemplate'&&APP.state.formWizard.step===1) renderFormWizard(); }
})();


/* ===================== PATCH 8 - TRUE BULK CRUD WIZARD FOR ALL CORE MODULES ===================== */
(function(){
  const P8_BASE_ROUTE_ACTION = typeof routeAction === 'function' ? routeAction : null;
  const P8_BASE_CLOSE_MODAL = typeof closeModal === 'function' ? closeModal : null;
  const P8_MAX_FILE_SIZE = 20 * 1024 * 1024;
  const p8Today = () => toDateInput(new Date());
  const p8Future = (days) => toDateInput(new Date(Date.now() + days * 86400000));
  const p8Uid = (prefix='p8') => prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);

  const P8_CONFIG = {
    projects:{
      titleAdd:'Thêm dự án', titleEdit:'Cập nhật dự án', subtitle:'Nhập một hoặc nhiều dự án theo dạng thẻ. Mỗi dự án có thể chọn thành viên và tài liệu riêng.', icon:'folder_open', module:'projects', moduleLabel:'Dự án', saveText:'Lưu dự án', size:'smart-xwide', primary:'Tên dự án',
      required:['Tên dự án','Loại dự án','Mã người phụ trách','Ngày bắt đầu','Ngày dự kiến kết thúc','Trạng thái','Mức độ ưu tiên'],
      fields:[
        {f:'Tên dự án',type:'text',wide:true,ph:'Nhập tên dự án ngắn gọn và dễ hiểu'},
        {f:'Loại dự án',type:'combo',options:()=>categoryOptions('Loại dự án'),ph:'Chọn loại dự án'},
        {f:'Mã người phụ trách',type:'combo',options:()=>personOptions(),ph:'Tìm kiếm và chọn người phụ trách...'},
        {f:'Ngày bắt đầu',type:'date'}, {f:'Ngày dự kiến kết thúc',type:'date'},
        {f:'Trạng thái',type:'combo',options:()=>fixedOptions('projectStatus'),ph:'Chọn trạng thái'},
        {f:'Mức độ ưu tiên',type:'combo',options:()=>fixedOptions('priority'),ph:'Chọn mức độ'},
        {f:'Tiến độ (%)',type:'number',readonly:true,ph:'0'},
        {f:'Mô tả',type:'textarea',wide:true,ph:'Mô tả mục tiêu, phạm vi và đầu ra mong đợi của dự án...'},
        {f:'Ghi chú',type:'textarea',wide:true,ph:'Thông tin bổ sung...'}
      ],
      blank:()=>({'Tên dự án':'','Loại dự án':'','Mã người phụ trách':'','Ngày bắt đầu':p8Today(),'Ngày dự kiến kết thúc':p8Future(30),'Trạng thái':'Chưa bắt đầu','Mức độ ưu tiên':'Bình thường','Tiến độ (%)':0,'Mô tả':'','Ghi chú':''})
    },
    employees:{
      titleAdd:'Thêm nhân sự', titleEdit:'Cập nhật nhân sự', subtitle:'Nhập nhiều hồ sơ nhân sự trong cùng một popup. Có thể chọn ảnh đại diện và tài liệu riêng cho từng hồ sơ.', icon:'groups', module:'employees', moduleLabel:'Nhân sự', saveText:'Lưu nhân sự', size:'smart-xwide', primary:'Họ và tên',
      required:['Họ và tên','Nhóm','Chức vụ','Trạng thái'],
      fields:[
        {f:'Họ và tên',type:'text',wide:true,ph:'Ví dụ: Nguyễn Văn An'},
        {f:'Nhóm',type:'combo',options:()=>activeTeamOptions(),ph:'Chọn đội/nhóm đang hoạt động...'},
        {f:'Chức vụ',type:'combo',options:()=>categoryOptions('Chức vụ'),ph:'Tìm chức vụ...'},
        {f:'Mã quản lý trực tiếp',type:'combo',options:()=>personOptions(),ph:'Tìm quản lý...'},
        {f:'Email',type:'email',ph:'ten@congty.vn'}, {f:'Số điện thoại',type:'text',ph:'0901234567'},
        {f:'Ngày tháng năm sinh',type:'date'},
        {f:'Trạng thái',type:'combo',options:()=>['Đang làm','Tạm nghỉ','Đã nghỉ'],ph:'Chọn trạng thái'},
        {f:'Ghi chú',type:'textarea',wide:true,ph:'Thông tin bổ sung...'}
      ],
      blank:()=>({'Họ và tên':'','Nhóm':'','Chức vụ':'','Mã quản lý trực tiếp':'','Email':'','Số điện thoại':'','Ngày tháng năm sinh':p8Today(),'Trạng thái':'Đang làm','Ảnh đại diện URL':'','Ghi chú':''})
    },
    users:{
      titleAdd:'Thêm người dùng', titleEdit:'Cập nhật người dùng', subtitle:'Tạo nhiều tài khoản trong cùng một lần, liên kết nhanh với hồ sơ nhân sự.', icon:'manage_accounts', module:'users', moduleLabel:'Người dùng', saveText:'Lưu người dùng', size:'smart-wide', primary:'Tên đăng nhập',
      required:['Tên đăng nhập','Vai trò','Mã nhân sự','Phạm vi dữ liệu','Trạng thái'],
      fields:[
        {f:'Tên đăng nhập',type:'text',ph:'Ví dụ: nguyenvana'},
        {f:'Mật khẩu',type:'password',ph:'Nhập mật khẩu'},
        {f:'Vai trò',type:'combo',options:()=>fixedOptions('userRole'),ph:'Chọn vai trò'},
        {f:'Mã nhân sự',type:'combo',options:()=>personOptions(),ph:'Tìm nhân sự...'},
        {f:'Phạm vi dữ liệu',type:'text',readonly:true,ph:'Tự động theo vai trò'},
        {f:'Trạng thái',type:'combo',options:()=>fixedOptions('userStatus'),ph:'Chọn trạng thái'},
        {f:'Ghi chú',type:'textarea',wide:true,ph:'Ghi chú tài khoản...'}
      ],
      blank:()=>({'Tên đăng nhập':'','Mật khẩu':'','Vai trò':'Nhóm','Mã nhân sự':'','Phạm vi dữ liệu':'Cá nhân','Trạng thái':'Hoạt động','Ghi chú':''})
    },
    files:{
      titleAdd:'Upload tài liệu', titleEdit:'Cập nhật tài liệu', subtitle:'Upload nhiều nhóm tài liệu trong một popup. Mỗi dòng có hồ sơ liên kết, loại tài liệu và file riêng.', icon:'folder_copy', module:'files', moduleLabel:'Tài liệu', saveText:'Upload tài liệu', size:'smart-xwide', primary:'Mã bản ghi liên quan',
      required:['Module liên quan','Mã bản ghi liên quan','Loại tài liệu'],
      fields:[
        {f:'Module liên quan',type:'combo',options:()=>['Dự án','Công việc','Nhân sự','KPI tháng'],ph:'Chọn module'},
        {f:'Mã bản ghi liên quan',type:'combo',options:()=>uploadRecordOptions(),ph:'Tìm mã hoặc tên hồ sơ...'},
        {f:'Loại tài liệu',type:'combo',options:()=>categoryOptions('Loại tài liệu'),ph:'Tìm loại tài liệu...'},
        {f:'Ghi chú',type:'text',wide:true,ph:'Ghi chú tài liệu'}
      ],
      blank:()=>({'Module liên quan':'','Mã bản ghi liên quan':'','Loại tài liệu':(APP.data.categories?.['Loại tài liệu']||[])[0]||'Tài liệu khác','Ghi chú':''})
    },
    kpiMonths:{
      titleAdd:'Tạo KPI tháng', titleEdit:'Cập nhật KPI tháng', subtitle:'Tạo KPI tháng hàng loạt theo nhân sự, tự ưu tiên mẫu KPI phù hợp và xem trước bộ chỉ tiêu trước khi lưu.', icon:'speed', module:'kpiMonths', moduleLabel:'KPI tháng', saveText:'Tạo KPI tháng', size:'smart-xwide p8-kpi-wide', primary:'Mã nhân sự',
      required:['Mã nhân sự','Mã mẫu KPI','Kỳ'],
      fields:[
        {f:'Mã nhân sự',type:'combo',options:()=>personOptions(),ph:'Tìm mã hoặc tên nhân sự...'},
        {f:'Mã mẫu KPI',type:'combo',options:(row)=>p8KpiTemplateOptions(row),ph:'Tìm mẫu KPI phù hợp...'},
        {f:'Kỳ',type:'month',ph:'Chọn tháng'}
      ],
      blank:()=>({'Mã nhân sự':'','Mã mẫu KPI':'','Kỳ':p8CurrentMonthValue()})
    },
    kpiTemplates:{
      titleAdd:'Thêm mẫu KPI', titleEdit:'Cập nhật mẫu KPI', subtitle:'Tạo mẫu KPI và Chỉ tiêu mẫu KPI trong cùng một luồng. Mỗi mẫu có bộ chỉ tiêu, trọng số, cách ghi nhận và quy tắc chấm điểm riêng.', icon:'description', module:'kpiTemplates', moduleLabel:'Mẫu KPI', saveText:'Lưu mẫu KPI', size:'smart-xwide p8-template-wide', primary:'Tên mẫu KPI',
      required:['Tên mẫu KPI','Phạm vi áp dụng','Giá trị áp dụng','Trạng thái'],
      fields:[
        {f:'Tên mẫu KPI',type:'text',ph:'Ví dụ: KPI Marketing'},
        {f:'Phạm vi áp dụng',type:'combo',options:()=>['Nhóm','Chức vụ','Nhân sự'],ph:'Chọn phạm vi'},
        {f:'Giá trị áp dụng',type:'combo',options:(row)=>p8KpiScopeOptions(row),ph:'Chọn giá trị áp dụng'},
        {f:'Trạng thái',type:'combo',options:()=>fixedOptions('templateStatus'),ph:'Chọn trạng thái'},
        {f:'Ngày hiệu lực',type:'date'},
        {f:'Mô tả',type:'textarea',wide:true,ph:'Mô tả mục tiêu, nguyên tắc áp dụng hoặc lưu ý của bộ KPI...'}
      ],
      blank:()=>({'Tên mẫu KPI':'','Phạm vi áp dụng':'Nhóm','Giá trị áp dụng':'','Mô tả':'','Trạng thái':'Đang áp dụng','Ngày hiệu lực':p8Today()})
    }
  };

  function p8CurrentMonthValue(){
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }
  function p8MonthValue(v){
    const d=parseDate(v);
    return d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`:String(v||'');
  }
  function p8BlankKpiDetail(source={}){
    const d=Object.assign({
      'Mã chỉ tiêu mẫu':'','Tên chỉ tiêu':'','Nhóm KPI':'','Đơn vị tính':'%',
      'Mục tiêu mặc định':100,'Trọng số (%)':'','Chỉ số nguồn':'SELF_INPUT','Cách ghi nhận':'Nhóm tự nhập',
      'Chiều đánh giá':'Càng cao càng tốt','Điểm tối đa':120,'Trạng thái':'Đang áp dụng','Ghi chú':''
    },source||{});
    d.__detailTempId=d.__detailTempId||p8Uid('ctkpi');
    d.__detailExpanded=d.__detailExpanded!==undefined?Boolean(d.__detailExpanded):true;
    p8ApplyKpiSource(d,false);
    return d;
  }
  function p8KpiCategoryValues(group,fallback=[]){
    const values=(APP.data.categories?.[group]||[]).map(v=>String(v||'').trim()).filter(Boolean);
    return values.length?values:fallback;
  }
  function p8KpiSourceRules(){return APP.data.kpiSourceRules||{
    TASK_COMPLETION_RATE:{label:'Công việc - Tỷ lệ hoàn thành',capture:'Tự động hệ thống',direction:'Càng cao càng tốt'},
    TASK_ON_TIME_RATE:{label:'Công việc - Tỷ lệ đúng hạn',capture:'Tự động hệ thống',direction:'Càng cao càng tốt'},
    TASK_COMPLETED_COUNT:{label:'Công việc - Số việc hoàn thành',capture:'Tự động hệ thống',direction:'Càng cao càng tốt'},
    TASK_OVERDUE_COUNT:{label:'Công việc - Số việc quá hạn',capture:'Tự động hệ thống',direction:'Càng thấp càng tốt'},
    TASK_WEIGHTED_COMPLETION_RATE:{label:'Công việc - Tỷ lệ hoàn thành theo trọng số',capture:'Tự động hệ thống',direction:'Càng cao càng tốt'},
    SELF_INPUT:{label:'Tự đánh giá / Quản lý duyệt',capture:'Nhóm tự nhập',direction:''}
  };}
  function p8KpiSourceOptions(){return Object.entries(p8KpiSourceRules()).map(([value,r])=>({value,label:r.label||value}));}
  function p8KpiSourceRule(code){return p8KpiSourceRules()[code]||p8KpiSourceRules().SELF_INPUT||{};}
  function p8ApplyKpiSource(detail,forceDirection=true){
    if(!detail)return;
    let source=String(detail['Chỉ số nguồn']||'').trim();
    if(!p8KpiSourceRules()[source])source='SELF_INPUT';
    const rule=p8KpiSourceRule(source);
    detail['Chỉ số nguồn']=source;
    detail['Cách ghi nhận']=rule.capture||'Nhóm tự nhập';
    if(rule.capture==='Tự động hệ thống'&&rule.unit)detail['Đơn vị tính']=rule.unit;
    if(forceDirection&&rule.direction)detail['Chiều đánh giá']=rule.direction;
    detail['Điểm tối đa']=120;
  }
  function p8KpiSourceSelect(row,detail){
    const value=String(detail?.['Chỉ số nguồn']||'SELF_INPUT');
    const options=p8KpiSourceOptions();
    return `<div class="smart-field"><label>Nguồn đo lường</label><select data-kpi-detail-field="Chỉ số nguồn" data-template-tempid="${escapeAttr(row.__tempId)}" data-detail-tempid="${escapeAttr(detail.__detailTempId)}">${options.map(o=>`<option value="${escapeAttr(o.value)}" ${String(o.value)===value?'selected':''}>${escapeHtml(o.label)}</option>`).join('')}</select></div>`;
  }
  function p8KpiCaptureView(detail){
    const auto=detail?.['Cách ghi nhận']==='Tự động hệ thống';
    return `<div class="smart-field p8-kpi-derived-field"><label>Cách ghi nhận</label><div class="p8-derived-tile ${auto?'auto':'manual'}"><span class="p8-derived-icon material-symbols-rounded">${auto?'auto_awesome':'person_edit'}</span><span class="p8-derived-copy"><strong>${auto?'Hệ thống tự tính':'Nhóm tự nhập'}</strong><small>${auto?'Theo nguồn đo lường':'Quản lý kiểm tra & duyệt'}</small></span></div></div>`;
  }
  function p8KpiDirectionView(row,detail){
    const auto=detail?.['Cách ghi nhận']==='Tự động hệ thống';
    const value=String(detail?.['Chiều đánh giá']||'Càng cao càng tốt');
    if(auto){
      const low=value==='Càng thấp càng tốt';
      return `<div class="smart-field p8-kpi-derived-field"><label>Chiều đánh giá</label><div class="p8-derived-tile direction"><span class="p8-derived-icon material-symbols-rounded">${low?'south':'north'}</span><span class="p8-derived-copy"><strong>${escapeHtml(value)}</strong><small>Tự xác định theo nguồn đo lường</small></span></div></div>`;
    }
    const options=APP.data.fixedOptions?.scoreDirection||['Càng cao càng tốt','Càng thấp càng tốt'];
    return `<div class="smart-field p8-kpi-direction-field"><label>Chiều đánh giá</label><div class="p8-direction-control"><span class="material-symbols-rounded">swap_vert</span><select data-kpi-detail-field="Chiều đánh giá" data-template-tempid="${escapeAttr(row.__tempId)}" data-detail-tempid="${escapeAttr(detail.__detailTempId)}">${options.map(o=>`<option value="${escapeAttr(o)}" ${String(o)===value?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select></div><small>Quy tắc quy đổi kết quả thành điểm KPI.</small></div>`;
  }
  function p8KpiDetailWeightRaw(row){
    return (row?.__details||[]).filter(d=>(d['Trạng thái']||'Đang áp dụng')==='Đang áp dụng').reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0);
  }
  function p8KpiDetailWeight(row){
    return round1(p8KpiDetailWeightRaw(row));
  }
  function p8KpiScopeOptions(row){
    const scope=String(row?.['Phạm vi áp dụng']||'Nhóm');
    if(scope==='Nhóm') return (APP.data.categories?.['Nhóm']||[]).map(v=>({value:v,label:v}));
    if(scope==='Chức vụ') return (APP.data.categories?.['Chức vụ']||[]).map(v=>({value:v,label:v}));
    if(scope==='Nhân sự') return personOptions();
    return [];
  }
  function p8TemplateMatchesEmployee(template,employeeId){
    if(!template||!employeeId)return false;
    const emp=(APP.data.employees||[]).find(e=>String(e['Mã nhân sự'])===String(employeeId));
    if(!emp)return false;
    const scope=String(template['Phạm vi áp dụng']||''), value=String(template['Giá trị áp dụng']||'');
    if(scope==='Nhóm') return normalizeText(value)===normalizeText(emp['Nhóm']);
    if(scope==='Chức vụ') return normalizeText(value)===normalizeText(emp['Chức vụ']);
    if(scope==='Nhân sự') return String(value)===String(employeeId) || normalizeText(value)===normalizeText(emp['Họ và tên']);
    return false;
  }
  function p8KpiTemplateOptions(row){
    const employeeId=row?.['Mã nhân sự']||'';
    return (APP.data.kpiTemplates||[])
      .filter(t=>t['Trạng thái']==='Đang áp dụng')
      .map(t=>({t,match:p8TemplateMatchesEmployee(t,employeeId)}))
      .sort((a,b)=>Number(b.match)-Number(a.match) || String(a.t['Tên mẫu KPI']||'').localeCompare(String(b.t['Tên mẫu KPI']||''),'vi'))
      .map(x=>({
        value:x.t['Mã mẫu KPI'],
        label:`${x.match?'✓ ':''}${x.t['Mã mẫu KPI']} - ${x.t['Tên mẫu KPI']}${x.match?' · Phù hợp':''}`
      }));
  }
  function p8AutoSuggestKpiTemplate(row){
    if(!row||row['Mã mẫu KPI']||!row['Mã nhân sự'])return false;
    const matches=(APP.data.kpiTemplates||[]).filter(t=>t['Trạng thái']==='Đang áp dụng'&&p8TemplateMatchesEmployee(t,row['Mã nhân sự']));
    if(matches.length===1){row['Mã mẫu KPI']=matches[0]['Mã mẫu KPI'];return true;}
    return false;
  }

  function p8FieldTip(kind,field){ return getFieldTooltip(P8_CONFIG[kind]?.module || kind, field) || ''; }
  function p8ModuleLabel(kind){ return P8_CONFIG[kind]?.moduleLabel || kind; }
  function p8ToClientRow(kind,source){
    const r=Object.assign({}, P8_CONFIG[kind].blank(), source||{});
    ['Ngày bắt đầu','Ngày dự kiến kết thúc','Ngày tháng năm sinh','Ngày hiệu lực'].forEach(f=>{ if(r[f]) r[f]=toDateInput(r[f]); });
    if(kind==='kpiMonths'&&r['Kỳ'])r['Kỳ']=p8MonthValue(r['Kỳ']);
    if(kind==='employees')r['Số điện thoại']=normalizePhoneForSave(r['Số điện thoại']);
    return p8DecorateRow(kind,r,false);
  }
  function p8DecorateRow(kind,row,expanded=true){
    row.__tempId=row.__tempId||p8Uid('row'); row.__expanded=row.__expanded!==undefined?row.__expanded:expanded;
    row.__errors=row.__errors||[]; row.__fieldErrors=row.__fieldErrors||{}; row.__files=row.__files||[]; row.__members=row.__members||[]; row.__avatarFile=row.__avatarFile||null; row.__avatarPreview=row.__avatarPreview||'';
    if(kind==='kpiTemplates'){
      row.__details=(Array.isArray(row.__details)&&row.__details.length?row.__details:[p8BlankKpiDetail()]).map(d=>p8BlankKpiDetail(d));
    }
    return row;
  }
  function p8BlankRow(kind){ return p8DecorateRow(kind, Object.assign({},P8_CONFIG[kind].blank()), true); }
  function p8RowTitle(kind,row){
    if(kind==='projects') return row['Tên dự án'] || 'Dự án chưa đặt tên';
    if(kind==='employees') return row['Họ và tên'] || 'Nhân sự chưa đặt tên';
    if(kind==='users') return row['Tên đăng nhập'] || 'Tài khoản chưa đặt tên';
    if(kind==='files') return row['Mã bản ghi liên quan'] ? `${row['Module liên quan']||'Hồ sơ'} · ${row['Mã bản ghi liên quan']}` : 'Nhóm tài liệu chưa chọn hồ sơ';
    if(kind==='kpiMonths') return row['Mã nhân sự'] ? `${employeeName(row['Mã nhân sự'])} · ${row['Kỳ']||''}` : 'KPI tháng chưa chọn nhân sự';
    if(kind==='kpiTemplates') return row['Tên mẫu KPI'] || 'Mẫu KPI chưa đặt tên';
    return row[P8_CONFIG[kind].primary] || 'Bản ghi chưa đặt tên';
  }
  function p8RowSummary(kind,row){
    const parts=[];
    if(kind==='projects') parts.push(employeeName(row['Mã người phụ trách'])||'Chưa chọn phụ trách', formatDate(row['Ngày bắt đầu'])+' → '+formatDate(row['Ngày dự kiến kết thúc']), row['Trạng thái']||'');
    else if(kind==='employees') parts.push(row['Nhóm']||'Chưa chọn Nhóm', row['Chức vụ']||'Chưa chọn chức vụ', row['Trạng thái']||'');
    else if(kind==='users') parts.push(row['Vai trò']||'', employeeName(row['Mã nhân sự'])||'Chưa liên kết nhân sự', row['Trạng thái']||'');
    else if(kind==='files') parts.push(row['Loại tài liệu']||'Chưa chọn loại', (row.__files||[]).length+' file');
    else if(kind==='kpiMonths'){
      const template=(APP.data.kpiTemplates||[]).find(t=>t['Mã mẫu KPI']===row['Mã mẫu KPI']);
      parts.push(employeeName(row['Mã nhân sự'])||'Chưa chọn nhân sự', template?.['Tên mẫu KPI']||row['Mã mẫu KPI']||'Chưa chọn mẫu', row['Kỳ']?formatPeriod(row['Kỳ']):'Chưa chọn kỳ');
    }
    else if(kind==='kpiTemplates') parts.push(row['Phạm vi áp dụng']||'', row['Giá trị áp dụng']||'Chưa chọn giá trị', `${(row.__details||[]).length} chỉ tiêu`, `${p8KpiDetailWeight(row)}% trọng số`);
    return parts.filter(Boolean).join(' · ');
  }

  function p8Options(list){ return (list||[]).map(o=>typeof o==='string'?{value:o,label:o}:o); }
  function p8Combo(dataAttr,row,field,options,placeholder){
    const opts=p8Options(typeof options==='function'?options(row):options);
    const selected=opts.find(o=>String(o.value)===String(row[field]||''));
    return `<div class="combo p8-combo"><div class="combo-control"><input class="combo-display" value="${escapeAttr(selected?.label||row[field]||'')}" placeholder="${escapeAttr(placeholder||'Tìm kiếm và chọn...')}" autocomplete="off"><button class="combo-arrow" type="button"><span class="material-symbols-rounded">expand_more</span></button></div><input type="hidden" ${dataAttr}="${escapeAttr(field)}" data-tempid="${escapeAttr(row.__tempId)}" value="${escapeAttr(row[field]||'')}"><div class="combo-source hidden">${opts.map(o=>`<span data-value="${escapeAttr(o.value)}" data-label="${escapeAttr(o.label)}"></span>`).join('')}</div></div>`;
  }
  function p8Input(dataAttr,row,def,kind){
    const f=def.f, req=(P8_CONFIG[kind].required||[]).includes(f), tip=p8FieldTip(kind,f);
    const label=`<label>${escapeHtml(f)}${req?'<span class="required">*</span>':''}${tip?tooltipIcon(tip):''}</label>`;
    let control='';
    if(def.type==='combo') control=p8Combo(dataAttr,row,f,def.options,def.ph);
    else if(def.type==='textarea') control=`<textarea ${dataAttr}="${escapeAttr(f)}" data-tempid="${escapeAttr(row.__tempId)}" placeholder="${escapeAttr(def.ph||'')}">${escapeHtml(row[f]||'')}</textarea>`;
    else control=`<input ${dataAttr}="${escapeAttr(f)}" data-tempid="${escapeAttr(row.__tempId)}" type="${def.type==='email'?'email':def.type==='password'?'password':def.type==='date'?'date':def.type==='month'?'month':def.type==='number'?'number':'text'}" value="${escapeAttr(row[f]??'')}" placeholder="${escapeAttr(def.ph||'')}" ${def.readonly?'readonly':''}>`;
    return `<div class="smart-field ${def.wide?'wide':''} ${row.__fieldErrors?.[f]?'p8-invalid-field':''}">${label}${control}<small>${escapeHtml(def.hint||tip||'')}</small></div>`;
  }
  function p8Toolbar(prefix='bulk'){
    return `<div class="smart-toolbar p8-toolbar"><button class="btn btn-sm" data-action="${prefix}-add-one"><span class="material-symbols-rounded">add</span>Thêm 1 bản ghi</button><button class="btn btn-sm" data-action="${prefix}-add-five"><span class="material-symbols-rounded">playlist_add</span>Thêm 5 bản ghi</button><button class="btn btn-sm" data-action="${prefix}-remove-empty"><span class="material-symbols-rounded">delete_sweep</span>Xóa bản ghi trống</button><button class="btn btn-sm" data-action="${prefix}-collapse"><span class="material-symbols-rounded">unfold_less</span>Thu gọn tất cả</button><button class="btn btn-sm" data-action="${prefix}-expand"><span class="material-symbols-rounded">unfold_more</span>Mở rộng tất cả</button></div>`;
  }
  function p8Shell(title,subtitle,step,total,labels,body,footer,size='smart-xwide',stepAction='bulk-step'){
    const steps=Array.from({length:total},(_,i)=>{
      const navAttr=`data-action="${stepAction}" data-step="${i+1}"`;
      return `<button type="button" class="smart-step p8-smart-step ${step===i+1?'active':step>i+1?'done':''}" ${navAttr}><span>${i+1}</span><b>${escapeHtml(labels[i]||('Bước '+(i+1)))}</b></button>`;
    }).join('');
    return `<div class="modal ${size} smart-modal refined-smart-modal p8-bulk-modal"><div class="modal-head smart-modal-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle||'')}</p></div><button class="modal-close" data-action="close-modal"><span class="material-symbols-rounded">close</span></button></div><div class="smart-steps p8-smart-steps">${steps}</div><div class="modal-body smart-modal-body p8-modal-body">${body}</div><div class="modal-footer smart-modal-footer"><div class="smart-progress-text">Có thể bấm trực tiếp vào số bước để chuyển bước.</div>${footer}</div></div>`;
  }

  function openBulkCrudWizard(kind,id=''){
    const cfg=P8_CONFIG[kind]; if(!cfg) return;
    APP.state.pendingFiles=[];
    let rows=[];
    if(id){
      const source=(APP.data[cfg.module]||[]).find(x=>x[bulkIdField(kind)]===id) || {};
      rows=[p8ToClientRow(kind,source)];
      if(kind==='projects') rows[0].__members=(APP.data.projectMembers||[]).filter(m=>m['Mã dự án']===id).map(m=>m['Mã nhân sự']);
      if(kind==='kpiTemplates'){
        const details=(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===id).map(d=>p8BlankKpiDetail(Object.assign({},d)));
        rows[0].__details=details.length?details:[p8BlankKpiDetail()];
        rows[0].__expanded=true;
      }
    } else rows=[p8BlankRow(kind)];
    APP.state.bulkWizard={kind,mode:id?'edit':'create',id,step:1,rows,errors:[]};
    renderBulkCrudWizard();
  }
  function bulkIdField(kind){ return {projects:'Mã dự án',employees:'Mã nhân sự',users:'Mã người dùng',files:'Mã tài liệu',kpiMonths:'Mã KPI tháng',kpiTemplates:'Mã mẫu KPI'}[kind]||''; }
  function renderBulkCrudWizard(){
    const w=APP.state.bulkWizard; if(!w) return;
    const cfg=P8_CONFIG[w.kind];
    const isTemplate=w.kind==='kpiTemplates';
    const total=isTemplate?3:2;
    const labels=isTemplate?['Thông tin mẫu','Chỉ tiêu mẫu KPI','Kiểm tra thông tin']:['Nhập thông tin','Kiểm tra thông tin'];
    let body='';
    if(isTemplate){
      body=w.step===1?p8BulkEntry(w,{hideKpiDetails:true}):w.step===2?p8KpiTemplateDetailStage(w):p8BulkReview(w);
    }else{
      body=w.step===1?p8BulkEntry(w):p8BulkReview(w);
    }
    let footer='';
    if(w.step===1){
      footer=`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="bulk-next">Tiếp tục <span class="material-symbols-rounded">arrow_forward</span></button>`;
    }else if(w.step<total){
      footer=`<button class="btn" data-action="bulk-back"><span class="material-symbols-rounded">arrow_back</span>Quay lại</button><button class="btn btn-primary" data-action="bulk-next">Tiếp tục <span class="material-symbols-rounded">arrow_forward</span></button>`;
    }else{
      footer=`<button class="btn" data-action="bulk-back"><span class="material-symbols-rounded">arrow_back</span>Quay lại</button><button class="btn btn-primary" data-action="bulk-save"><span class="material-symbols-rounded">save</span>${escapeHtml(cfg.saveText)}</button>`;
    }
    openModal(p8Shell(w.mode==='edit'?cfg.titleEdit:cfg.titleAdd,cfg.subtitle,w.step,total,labels,body,footer,cfg.size,'bulk-step'));
  }
  function p8BulkEntry(w,opts={}){
    const cfg=P8_CONFIG[w.kind];
    const intro=`<div class="flow-hero compact p8-hero"><div class="flow-hero-icon"><span class="material-symbols-rounded">${cfg.icon}</span></div><div><strong>${escapeHtml(w.mode==='edit'?cfg.titleEdit:cfg.titleAdd)}</strong><small>${escapeHtml(cfg.subtitle)}</small></div><div class="flow-hero-tags"><span class="flow-mini-chip neutral">${w.rows.length} bản ghi</span><span class="flow-mini-chip success">Toolbar nhập liệu hàng loạt</span></div></div>`;
    return `<div class="smart-wizard task-crud-layout p8-layout">${intro}${w.mode==='create'?p8Toolbar('bulk'):''}<div class="smart-record-list flow-record-list">${w.rows.map((r,i)=>p8BulkCard(w.kind,r,i,opts)).join('')}</div></div>`;
  }
  function p8KpiTemplateDetailStage(w){
    const cfg=P8_CONFIG[w.kind];
    const intro=`<div class="flow-hero compact p8-hero"><div class="flow-hero-icon"><span class="material-symbols-rounded">rule</span></div><div><strong>Thiết lập Chỉ tiêu mẫu KPI</strong><small>Mỗi Mẫu KPI bên dưới có bộ chỉ tiêu riêng. Có thể thêm nhiều chỉ tiêu, chia đều trọng số và kiểm tra tổng 100% ngay tại đây.</small></div><div class="flow-hero-tags"><span class="flow-mini-chip neutral">${w.rows.length} mẫu KPI</span><span class="flow-mini-chip success">${w.rows.reduce((s,r)=>s+(r.__details||[]).length,0)} chỉ tiêu</span></div></div>`;
    return `<div class="smart-wizard task-crud-layout p8-layout">${intro}<div class="smart-record-list flow-record-list">${w.rows.map((r,i)=>p8BulkCard(w.kind,r,i,{onlyKpiDetails:true})).join('')}</div></div>`;
  }

  function p8EmployeeAvatarVisual(row){
    if(row.__avatarPreview)return `<span class="employee-avatar-preview"><img src="${escapeAttr(row.__avatarPreview)}" alt="Ảnh đại diện mới"></span>`;
    const raw=String(row['Ảnh đại diện URL']||'').trim();
    if(/^data:image\//i.test(raw)||(/^https?:\/\//i.test(raw)&&!/drive\.google\.com\/file\/d\//i.test(raw))){
      return `<span class="employee-avatar-preview"><img src="${escapeAttr(raw)}" alt="Ảnh đại diện"></span>`;
    }
    const id=row['Mã nhân sự']||'';
    if(id)return avatarHtml(id,72);
    return `<span class="avatar employee-avatar-fallback" style="width:72px;height:72px;font-size:20px">${escapeHtml(initials(row['Họ và tên']||'NS'))}</span>`;
  }
  function p8EmployeeUploadPanel(row){
    const raw=String(row['Ảnh đại diện URL']||'').trim();
    const driveMatch=raw.match(/^drive-file:(.+)$/i);
    const avatarName=row.__avatarFile?.name||'';
    return `<div class="employee-upload-grid">
      <div class="flow-side-card employee-avatar-card">
        <div class="flow-section-mini-title">Ảnh đại diện nhân sự ${tooltipIcon('Chọn ảnh PNG/JPG/WEBP tối đa 5MB. Hệ thống tự căn giữa và chuẩn hóa thành 500 × 500 px khi lưu.')}</div>
        <div class="employee-avatar-row">
          <div class="employee-avatar-visual">${p8EmployeeAvatarVisual(row)}</div>
          <div class="employee-avatar-actions">
            <strong>${avatarName?escapeHtml(avatarName):(driveMatch?'Đã có ảnh đại diện':'Chưa chọn ảnh mới')}</strong>
            <small>${avatarName?formatFileSize(row.__avatarFile.size):'Ảnh mới chỉ được đọc cục bộ để xem trước, không tải Drive trước khi lưu.'}</small>
            <div class="row-actions employee-avatar-buttons">
              <button type="button" class="btn btn-sm" data-action="employee-avatar-trigger" data-tempid="${row.__tempId}"><span class="material-symbols-rounded">add_a_photo</span>${avatarName?'Đổi ảnh':'Chọn ảnh'}</button>
              ${avatarName?`<button type="button" class="btn btn-sm btn-danger" data-action="employee-avatar-clear" data-tempid="${row.__tempId}"><span class="material-symbols-rounded">close</span>Bỏ ảnh mới</button>`:''}
              ${driveMatch?`<button type="button" class="btn btn-sm" data-action="employee-avatar-preview" data-fileid="${escapeAttr(driveMatch[1])}"><span class="material-symbols-rounded">visibility</span>Xem ảnh hiện tại</button>`:''}
            </div>
            <input class="hidden" type="file" accept="image/png,image/jpeg,image/webp" data-employee-avatar-file="${row.__tempId}">
          </div>
        </div>
      </div>
      <div class="flow-side-card employee-doc-card">${p8FileBox('employee-doc',row,'Tài liệu liên quan nhân sự')}</div>
    </div>`;
  }
  // Chuẩn hóa ảnh đại diện thành ảnh vuông 500 x 500 px trước khi xem trước/lưu.
  async function p8ResizeAvatar500(file){
    const bitmap=await createImageBitmap(file);
    try{
      const size=500,sw=bitmap.width,sh=bitmap.height;
      const side=Math.min(sw,sh),sx=Math.round((sw-side)/2),sy=Math.round((sh-side)/2);
      const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
      const ctx=canvas.getContext('2d',{alpha:true});
      if(!ctx)throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.drawImage(bitmap,sx,sy,side,side,0,0,size,size);
      const mime=file.type==='image/png'?'image/png':(file.type==='image/webp'?'image/webp':'image/jpeg');
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Không thể chuẩn hóa ảnh.')),mime,mime==='image/jpeg'?0.92:0.9));
      const ext=mime==='image/png'?'png':(mime==='image/webp'?'webp':'jpg');
      const name=String(file.name||'avatar').replace(/\.[^.]+$/,'')+'_500x500.'+ext;
      return new File([blob],name,{type:mime,lastModified:Date.now()});
    }finally{bitmap.close?.();}
  }
  async function p8EmployeeSetAvatar(tempId,file){
    const w=APP.state.bulkWizard;if(!w||w.kind!=='employees'||!file)return;
    const row=w.rows.find(x=>x.__tempId===tempId);if(!row)return;
    if(!/^image\/(png|jpeg|webp)$/i.test(file.type||'')){showToast('File không hợp lệ','Ảnh đại diện chỉ hỗ trợ PNG, JPG/JPEG hoặc WEBP.','warning');return;}
    if(file.size>5*1024*1024){showToast('Ảnh quá lớn','Ảnh gốc tối đa 5 MB.','warning');return;}
    try{
      showToast('Đang xử lý ảnh','Đang căn giữa và chuẩn hóa ảnh thành 500 × 500 px.','processing',2500);
      const resized=await p8ResizeAvatar500(file);
      row.__avatarFile=resized;
      row.__avatarPreview=await fileToBase64(resized);
      renderBulkCrudWizard();
    }catch(err){showToast('Không thể xử lý ảnh',err?.message||'Vui lòng chọn lại ảnh.','error');}
  }
  function p8EmployeeClearAvatar(tempId){
    const w=APP.state.bulkWizard;if(!w||w.kind!=='employees')return;
    const row=w.rows.find(x=>x.__tempId===tempId);if(!row)return;
    row.__avatarFile=null;row.__avatarPreview='';renderBulkCrudWizard();
  }

  function p8KpiDetailInput(row,detail,field,type='text',placeholder=''){
    const value=detail?.[field]??'';
    return `<div class="smart-field"><label>${escapeHtml(field)}</label><input type="${type}" data-kpi-detail-field="${escapeAttr(field)}" data-template-tempid="${escapeAttr(row.__tempId)}" data-detail-tempid="${escapeAttr(detail.__detailTempId)}" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}"></div>`;
  }
  function p8KpiDetailSelect(row,detail,field,options){
    const value=String(detail?.[field]??'');
    return `<div class="smart-field"><label>${escapeHtml(field)}</label><select data-kpi-detail-field="${escapeAttr(field)}" data-template-tempid="${escapeAttr(row.__tempId)}" data-detail-tempid="${escapeAttr(detail.__detailTempId)}">${value?'':'<option value="">Chọn...</option>'}${(options||[]).map(o=>`<option value="${escapeAttr(o)}" ${String(o)===value?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select></div>`;
  }
  function p8KpiTemplateDetailPanel(row){
    const details=row.__details||[];
    details.forEach(d=>p8ApplyKpiSource(d,false));
    const weight=p8KpiDetailWeight(row);
    const validWeight=Math.abs(p8KpiDetailWeightRaw(row)-100)<0.01;
    const automatic=details.filter(d=>d['Cách ghi nhận']==='Tự động hệ thống').length;
    const groupOptions=p8KpiCategoryValues('Nhóm KPI',['Tiến độ công việc','Đúng hạn','Chất lượng','Phối hợp','Cải tiến']);
    const unitOptions=p8KpiCategoryValues('Đơn vị tính',['%','Điểm','Bài','Lần','Hồ sơ','Khách hàng','Đồng','Giờ','Ngày']);
    return `<section class="p8-kpi-detail-section">
      <div class="p8-kpi-detail-toolbar">
        <div class="p8-kpi-detail-title">
          <span class="material-symbols-rounded">rule</span>
          <div><strong>Chỉ tiêu mẫu KPI</strong><small>Chọn Nguồn đo lường; hệ thống tự xác định chỉ tiêu nào lấy tự động và chỉ tiêu nào Nhóm tự đánh giá. Trần điểm cố định 120%.</small></div>
        </div>
        <div class="p8-kpi-detail-summary">
          <span class="flow-mini-chip neutral">${details.length} chỉ tiêu</span>
          <span class="flow-mini-chip neutral">${automatic} tự động</span>
          <span class="flow-mini-chip neutral">Trần 120%</span>
          <span class="flow-mini-chip ${validWeight?'success':'danger'}" data-kpi-weight-chip="${escapeAttr(row.__tempId)}">${weight}% / 100%</span>
        </div>
      </div>
      <div class="p8-kpi-weight-track"><span data-kpi-weight-bar="${escapeAttr(row.__tempId)}" style="width:${clamp(Number(weight),0,100)}%"></span></div>
      <div class="p8-kpi-detail-actions">
        <button class="btn btn-sm" data-action="kpi-detail-add-one" data-template-tempid="${row.__tempId}"><span class="material-symbols-rounded">add</span>Thêm chỉ tiêu</button>
        <button class="btn btn-sm" data-action="kpi-detail-add-five" data-template-tempid="${row.__tempId}"><span class="material-symbols-rounded">playlist_add</span>Thêm 5</button>
        <button class="btn btn-sm" data-action="kpi-detail-balance" data-template-tempid="${row.__tempId}"><span class="material-symbols-rounded">percent</span>Chia đều 100%</button>
        <button class="btn btn-sm" data-action="kpi-detail-remove-empty" data-template-tempid="${row.__tempId}"><span class="material-symbols-rounded">delete_sweep</span>Xóa dòng trống</button>
        <span class="p8-kpi-action-separator"></span>
        <button class="btn btn-sm" data-action="kpi-detail-collapse-all" data-template-tempid="${row.__tempId}"><span class="material-symbols-rounded">unfold_less</span>Thu gọn tất cả</button>
        <button class="btn btn-sm" data-action="kpi-detail-expand-all" data-template-tempid="${row.__tempId}"><span class="material-symbols-rounded">unfold_more</span>Mở rộng tất cả</button>
      </div>
      <div class="p8-kpi-detail-list">
        ${details.map((d,di)=>{
          const expanded=d.__detailExpanded!==false;
          const rule=p8KpiSourceRule(d['Chỉ số nguồn']);
          const summary=[d['Nhóm KPI']||'Chưa chọn nhóm',d['Đơn vị tính']||'Chưa chọn đơn vị',rule.label||d['Cách ghi nhận']].filter(Boolean).join(' · ');
          const body=expanded?`<div class="p8-kpi-indicator-body">
            <div class="p8-kpi-indicator-grid primary p8-kpi-grid-v2">
              ${p8KpiDetailInput(row,d,'Tên chỉ tiêu','text','Ví dụ: Số bài viết hoàn thành')}
              ${p8KpiDetailSelect(row,d,'Nhóm KPI',groupOptions)}
              ${p8KpiDetailSelect(row,d,'Đơn vị tính',unitOptions)}
              ${p8KpiDetailInput(row,d,'Mục tiêu mặc định','number','100')}
              ${p8KpiDetailInput(row,d,'Trọng số (%)','number','20')}
              ${p8KpiSourceSelect(row,d)}
              ${p8KpiCaptureView(d)}
            </div>
            <div class="p8-kpi-indicator-grid advanced p8-kpi-advanced-v2">
              ${p8KpiDirectionView(row,d)}
              ${p8KpiDetailSelect(row,d,'Trạng thái',APP.data.fixedOptions?.templateStatus||['Đang áp dụng','Ngừng áp dụng'])}
              ${p8KpiDetailInput(row,d,'Ghi chú','text','Ghi chú chỉ tiêu...')}
              <div class="smart-field p8-kpi-cap-field"><label>Trần điểm</label><div class="p8-fixed-cap"><strong>120%</strong><small>Cố định toàn hệ thống</small></div></div>
            </div>
          </div>`:'';
          return `<article class="p8-kpi-indicator-card ${expanded?'is-expanded':'is-collapsed'}">
            <div class="p8-kpi-indicator-head">
              <div class="p8-kpi-indicator-index">${di+1}</div>
              <div class="p8-kpi-indicator-name"><strong>${escapeHtml(d['Tên chỉ tiêu']||'Chỉ tiêu chưa đặt tên')}</strong><small>${escapeHtml(summary)}</small></div>
              <div class="p8-kpi-indicator-meta"><span>${round1(d['Trọng số (%)']||0)}%</span><span>${escapeHtml(d['Cách ghi nhận'])}</span><span>${escapeHtml(d['Trạng thái']||'Đang áp dụng')}</span></div>
              <div class="p8-kpi-indicator-actions">
                <button class="row-action" data-action="kpi-detail-toggle" data-template-tempid="${row.__tempId}" data-detail-tempid="${d.__detailTempId}" title="${expanded?'Thu gọn chỉ tiêu':'Mở rộng chỉ tiêu'}"><span class="material-symbols-rounded">${expanded?'expand_less':'expand_more'}</span></button>
                <button class="row-action" data-action="kpi-detail-duplicate" data-template-tempid="${row.__tempId}" data-detail-tempid="${d.__detailTempId}" title="Nhân bản chỉ tiêu"><span class="material-symbols-rounded">content_copy</span></button>
                <button class="row-action danger" data-action="kpi-detail-delete" data-template-tempid="${row.__tempId}" data-detail-tempid="${d.__detailTempId}" title="Xóa chỉ tiêu"><span class="material-symbols-rounded">delete</span></button>
              </div>
            </div>
            ${body}
          </article>`;
        }).join('')}
      </div>
      <div class="p8-kpi-detail-note"><span class="material-symbols-rounded">info</span><div><b>Nhóm KPI chỉ dùng để phân loại/báo cáo.</b> Nguồn đo lường quyết định logic. Chỉ tiêu có nguồn Công việc được tính tự động; các KPI nghiệp vụ riêng như “Đăng 30 bài/tháng” chọn “Tự đánh giá / Quản lý duyệt”. Nhóm tự khai nhưng chỉ số được quản lý duyệt mới trở thành điểm chính thức.</div></div>
    </section>`;
  }
  function p8KpiMonthContextPanel(row){
    const employee=(APP.data.employees||[]).find(e=>e['Mã nhân sự']===row['Mã nhân sự']);
    const template=(APP.data.kpiTemplates||[]).find(t=>t['Mã mẫu KPI']===row['Mã mẫu KPI']);
    const details=template?(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===template['Mã mẫu KPI']&&d['Trạng thái']!=='Ngừng áp dụng'):[];
    const weight=round1(details.reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0));
    const match=template&&employee?p8TemplateMatchesEmployee(template,employee['Mã nhân sự']):false;
    return `<section class="p8-kpi-month-context">
      <div class="p8-kpi-context-card">
        <div class="p8-kpi-context-icon">${employee?avatarHtml(employee['Mã nhân sự'],42):'<span class="material-symbols-rounded">person_search</span>'}</div>
        <div><small>Nhân sự áp dụng</small><strong>${escapeHtml(employee?.['Họ và tên']||'Chưa chọn nhân sự')}</strong><p>${escapeHtml(employee?`${employee['Nhóm']||''} · ${employee['Chức vụ']||''}`:'Chọn nhân sự để hệ thống ưu tiên mẫu KPI phù hợp.')}</p></div>
      </div>
      <div class="p8-kpi-context-card template">
        <div class="p8-kpi-context-icon"><span class="material-symbols-rounded">description</span></div>
        <div class="p8-kpi-context-main"><small>Mẫu KPI được chọn</small><strong>${escapeHtml(template?.['Tên mẫu KPI']||'Chưa chọn mẫu KPI')}</strong><p>${template?`${escapeHtml(template['Phạm vi áp dụng']||'')} · ${escapeHtml(template['Giá trị áp dụng']||'')}`:'Các mẫu phù hợp với nhân sự sẽ được đưa lên đầu danh sách.'}</p></div>
        ${template?`<span class="badge ${match?'badge-green':'badge-orange'}">${match?'Phù hợp phạm vi':'Kiểm tra phạm vi'}</span>`:''}
      </div>
      <div class="p8-kpi-context-metrics">
        <div><small>Chỉ tiêu</small><strong>${details.length}</strong></div>
        <div><small>Trọng số</small><strong class="${Math.abs(weight-100)<.01?'text-success':'text-danger'}">${weight}%</strong></div>
        <div><small>Tự động</small><strong>${details.filter(d=>d['Cách ghi nhận']==='Tự động hệ thống').length}</strong></div>
        <div><small>Nhóm tự nhập</small><strong>${details.filter(d=>d['Cách ghi nhận']==='Nhóm tự nhập').length}</strong></div>
      </div>
      ${details.length?`<div class="p8-kpi-preview-list">${details.slice(0,5).map(d=>`<span><b>${escapeHtml(d['Tên chỉ tiêu'])}</b><small>${round1(d['Trọng số (%)'])}% · ${escapeHtml(d['Cách ghi nhận'])}</small></span>`).join('')}${details.length>5?`<span class="more">+${details.length-5} chỉ tiêu khác</span>`:''}</div>`:''}
    </section>`;
  }
  function p8KpiReviewExtra(kind,row){
    if(kind==='kpiTemplates'){
      const details=row.__details||[], weight=p8KpiDetailWeight(row);
      return `<div class="p8-review-extra"><strong>${details.length} Chỉ tiêu mẫu KPI · ${weight}% trọng số</strong><div>${details.map(d=>`<span>${escapeHtml(d['Tên chỉ tiêu']||'Chưa đặt tên')} <b>${round1(d['Trọng số (%)']||0)}%</b></span>`).join('')}</div></div>`;
    }
    if(kind==='kpiMonths'){
      const t=(APP.data.kpiTemplates||[]).find(x=>x['Mã mẫu KPI']===row['Mã mẫu KPI']);
      const ds=t?(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===t['Mã mẫu KPI']&&d['Trạng thái']!=='Ngừng áp dụng'):[];
      return `<div class="p8-review-extra"><strong>${escapeHtml(t?.['Tên mẫu KPI']||'Chưa chọn mẫu')}</strong><div><span>${ds.length} chỉ tiêu</span><span>${round1(ds.reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0))}% trọng số</span></div></div>`;
    }
    return '';
  }
  function p8UpdateKpiWeightUI(row){
    if(!row)return;
    const weight=p8KpiDetailWeight(row), ok=Math.abs(p8KpiDetailWeightRaw(row)-100)<.01;
    const chip=document.querySelector(`[data-kpi-weight-chip="${CSS.escape(row.__tempId)}"]`);
    if(chip){chip.textContent=`${weight}% / 100%`;chip.classList.toggle('success',ok);chip.classList.toggle('danger',!ok);}
    const bar=document.querySelector(`[data-kpi-weight-bar="${CSS.escape(row.__tempId)}"]`);
    if(bar)bar.style.width=`${clamp(Number(weight),0,100)}%`;
  }
  function p8AddKpiDetails(templateTempId,count){
    const w=APP.state.bulkWizard;if(!w||w.kind!=='kpiTemplates')return;
    p8SyncBulkFromDom();
    const row=w.rows.find(r=>r.__tempId===templateTempId);if(!row)return;
    row.__details=row.__details||[];
    for(let i=0;i<count;i++)row.__details.push(p8BlankKpiDetail());
    renderBulkCrudWizard();
  }
  function p8RemoveEmptyKpiDetails(templateTempId){
    const w=APP.state.bulkWizard;if(!w||w.kind!=='kpiTemplates')return;
    p8SyncBulkFromDom();
    const row=w.rows.find(r=>r.__tempId===templateTempId);if(!row)return;
    row.__details=(row.__details||[]).filter(d=>String(d['Tên chỉ tiêu']||'').trim()||String(d['Nhóm KPI']||'').trim()||Number(d['Trọng số (%)']||0));
    if(!row.__details.length)row.__details=[p8BlankKpiDetail()];
    renderBulkCrudWizard();
  }
  function p8BalanceKpiWeights(templateTempId){
    const w=APP.state.bulkWizard;if(!w||w.kind!=='kpiTemplates')return;
    p8SyncBulkFromDom();
    const row=w.rows.find(r=>r.__tempId===templateTempId);if(!row)return;
    const details=(row.__details||[]).filter(d=>(d['Trạng thái']||'Đang áp dụng')==='Đang áp dụng');if(!details.length)return;
    const base=Math.floor((100/details.length)*100)/100;
    let used=0;
    details.forEach((d,i)=>{const v=i===details.length-1?Math.round((100-used)*100)/100:base;d['Trọng số (%)']=v;used=Math.round((used+Number(v))*100)/100;});
    renderBulkCrudWizard();
  }
  function p8SetKpiDetailsExpanded(templateTempId,expanded){
    const w=APP.state.bulkWizard;if(!w||w.kind!=='kpiTemplates')return;
    p8SyncBulkFromDom();
    const row=w.rows.find(r=>r.__tempId===templateTempId);if(!row)return;
    (row.__details||[]).forEach(d=>d.__detailExpanded=Boolean(expanded));
    renderBulkCrudWizard();
  }
  function p8KpiDetailRowAction(action,templateTempId,detailTempId){
    const w=APP.state.bulkWizard;if(!w||w.kind!=='kpiTemplates')return;
    p8SyncBulkFromDom();
    const row=w.rows.find(r=>r.__tempId===templateTempId);if(!row)return;
    const details=row.__details||[], idx=details.findIndex(d=>d.__detailTempId===detailTempId);if(idx<0)return;
    if(action==='toggle'){
      details[idx].__detailExpanded=details[idx].__detailExpanded===false;
    }else if(action==='duplicate'){
      const copy=p8BlankKpiDetail(Object.assign({},details[idx],{'Mã chỉ tiêu mẫu':'',__detailExpanded:true}, {__detailTempId:p8Uid('ctkpi')}));
      details.splice(idx+1,0,copy);
    }else if(action==='delete'){
      details.splice(idx,1);
      if(!details.length)details.push(p8BlankKpiDetail());
    }
    renderBulkCrudWizard();
  }

function p8BulkCard(kind,row,i,opts={}){
    const cfg=P8_CONFIG[kind], invalid=(row.__errors||[]).length, fileCount=(row.__files||[]).length, memberCount=(row.__members||[]).length;
    const extraChips=kind==='projects'
      ?`<span class="flow-mini-chip neutral">${memberCount} thành viên</span><span class="flow-mini-chip neutral">${fileCount} file</span>`
      :kind==='employees'
        ?`<span class="flow-mini-chip neutral">${row.__avatarFile?'1 ảnh mới':'Ảnh hồ sơ'}</span><span class="flow-mini-chip neutral">${fileCount} tài liệu</span>`
        :kind==='files'
          ?`<span class="flow-mini-chip neutral">${fileCount} file</span>`
          :kind==='kpiTemplates'
            ?`<span class="flow-mini-chip neutral">${(row.__details||[]).length} chỉ tiêu</span><span class="flow-mini-chip ${Math.abs(p8KpiDetailWeightRaw(row)-100)<.01?'success':'danger'}">${p8KpiDetailWeight(row)}% trọng số</span>`
            :kind==='kpiMonths'
              ?`<span class="flow-mini-chip neutral">${row['Kỳ']?formatPeriod(row['Kỳ']):'Chưa chọn kỳ'}</span>`
              :'';
    const fields=opts.onlyKpiDetails?'':`<div class="flow-field-grid p8-field-grid ${kind==='kpiMonths'?'p8-kpi-grid':''}">${cfg.fields.map(def=>p8Input('data-bulk-field',row,def,kind)).join('')}</div>`;
    const projectExtra=!opts.onlyKpiDetails&&kind==='projects'?`<div class="flow-split-grid"><div class="flow-side-card"><div class="flow-section-mini-title">Thành viên tham gia ${tooltipIcon('Chọn thành viên tham gia riêng cho dự án này.')}</div>${multiPersonPicker('bulk-members-'+row.__tempId,row.__members||[],'Người phụ trách chính không cần chọn lại.')}</div><div class="flow-side-card">${p8FileBox('bulk',row,'Tài liệu đính kèm')}</div></div>`:'';
    const employeeExtra=!opts.onlyKpiDetails&&kind==='employees'?p8EmployeeUploadPanel(row):'';
    const fileExtra=!opts.onlyKpiDetails&&kind==='files'?`<div class="flow-side-card p8-file-only">${p8FileBox('bulk',row,'File cần upload')}</div>`:'';
    const kpiTemplateExtra=kind==='kpiTemplates'&&!opts.hideKpiDetails?p8KpiTemplateDetailPanel(row):'';
    const kpiMonthExtra=!opts.onlyKpiDetails&&kind==='kpiMonths'?p8KpiMonthContextPanel(row):'';
    const expandedBody=`${fields}${kpiMonthExtra}${kpiTemplateExtra}${projectExtra}${employeeExtra}${fileExtra}${invalid?`<div class="wizard-error-summary">${row.__errors.map(e=>escapeHtml(e)).join('<br>')}</div>`:''}`;
    const bodyInner=row.__expanded?expandedBody:(invalid?`<div class="wizard-error-summary compact">${row.__errors.map(e=>escapeHtml(e)).join('<br>')}</div>`:'');
    const createActions=!opts.onlyKpiDetails&&APP.state.bulkWizard?.mode==='create'?`<button class="row-action" data-action="bulk-row-duplicate" data-tempid="${row.__tempId}" title="Nhân bản"><span class="material-symbols-rounded">content_copy</span></button><button class="row-action danger" data-action="bulk-row-delete" data-tempid="${row.__tempId}" title="Xóa dòng"><span class="material-symbols-rounded">delete</span></button>`:'';
    return `<article class="smart-record-card flow-task-card p8-card ${row.__expanded?'is-open':'is-collapsed'} ${invalid?'has-error':''}"><div class="smart-record-head flow-task-head"><div class="smart-row-index ${invalid?'bad':'ok'}">${i+1}</div><div class="smart-record-title"><strong>${escapeHtml(p8RowTitle(kind,row))}</strong><small>${escapeHtml(p8RowSummary(kind,row)||'Nhập thông tin bản ghi')}</small></div><div class="smart-record-status"><div class="flow-card-chip-row">${extraChips}<span class="flow-mini-chip ${invalid?'danger':'success'}">${invalid?'Cần sửa':'Đang nhập'}</span></div></div><div class="row-actions"><button class="row-action" data-action="bulk-row-toggle" data-tempid="${row.__tempId}" title="Thu gọn / mở rộng toàn bộ bản ghi"><span class="material-symbols-rounded">${row.__expanded?'expand_less':'expand_more'}</span></button>${createActions}</div></div>${bodyInner?`<div class="flow-task-body">${bodyInner}</div>`:''}</article>`;
  }
  function p8FileBox(prefix,row,title){
    const fileCount=(row.__files||[]).length;
    return `<div class="flow-section-mini-title">${escapeHtml(title||'Tài liệu')}</div><div class="p8-upload-zone"><span class="material-symbols-rounded">cloud_upload</span><div><strong>${fileCount?fileCount+' file đã chọn':'Chọn file để đính kèm'}</strong><small>Hỗ trợ PDF, DOCX, XLSX, PNG, JPG; tối đa 20MB/tệp.</small></div><button class="btn btn-sm" data-action="${prefix}-file-trigger" data-tempid="${row.__tempId}">Chọn tệp</button><input class="hidden" type="file" multiple data-${prefix}-file="${row.__tempId}"></div><div class="pending-files compact">${fileCount?row.__files.map((f,fi)=>`<div class="file-chip"><div class="file-chip-icon"><span class="material-symbols-rounded">${fileIcon(f.type)}</span></div><div><strong>${escapeHtml(f.name)}</strong><small>${formatFileSize(f.size)}</small></div><div class="file-chip-actions"><button class="row-action danger" data-action="${prefix}-file-remove" data-tempid="${row.__tempId}" data-fileindex="${fi}"><span class="material-symbols-rounded">close</span></button></div></div>`).join(''):'<div class="empty-note">Chưa chọn file.</div>'}</div>`;
  }

  function p8BulkReview(w){
    p8SyncBulkFromDom(); p8ValidateBulk(false);
    const totalErr=w.rows.reduce((s,r)=>s+(r.__errors||[]).length,0);
    return `<div class="smart-review p8-review"><div class="smart-review-head"><div><h2>Kiểm tra thông tin trước khi lưu</h2><p>${w.rows.length} bản ghi · ${w.rows.reduce((s,r)=>s+(r.__files||[]).length,0)} file · ${totalErr} lỗi cần sửa</p></div><span class="badge ${totalErr?'badge-red':'badge-green'}">${totalErr?totalErr+' lỗi cần sửa':'Dữ liệu hợp lệ'}</span></div><div class="smart-review-list">${w.rows.map((r,i)=>`<div class="smart-review-item ${r.__errors?.length?'bad':'ok'}"><div class="smart-row-index ${r.__errors?.length?'bad':'ok'}">${i+1}</div><div><strong>${escapeHtml(p8RowTitle(w.kind,r))}</strong><p>${escapeHtml(p8RowSummary(w.kind,r))}</p>${p8KpiReviewExtra(w.kind,r)}${r.__errors?.length?`<div class="wizard-error-summary">${r.__errors.map(e=>escapeHtml(e)).join('<br>')}</div>`:''}</div><div>${r.__errors?.length?statusBadge('Cần sửa'):statusBadge('Hợp lệ')}</div></div>`).join('')}</div></div>`;
  }
  function p8SyncBulkFromDom(){
    const w=APP.state.bulkWizard; if(!w) return;
    document.querySelectorAll('[data-bulk-field]').forEach(el=>{ const r=w.rows.find(x=>x.__tempId===el.dataset.tempid); if(r) r[el.dataset.bulkField]=el.value; });
    document.querySelectorAll('[data-kpi-detail-field]').forEach(el=>{
      const r=w.rows.find(x=>x.__tempId===el.dataset.templateTempid); if(!r)return;
      const d=(r.__details||[]).find(x=>x.__detailTempId===el.dataset.detailTempid); if(!d)return;
      const f=el.dataset.kpiDetailField;
      d[f]=['Mục tiêu mặc định','Trọng số (%)','Điểm tối đa'].includes(f) ? (el.value===''?'':Number(el.value)) : el.value;
      if(f==='Chỉ số nguồn')p8ApplyKpiSource(d,true); else d['Điểm tối đa']=120;
    });
    w.rows.forEach(r=>{ const key='bulk-members-'+r.__tempId; if(document.querySelector(`[data-multi-options="${CSS.escape(key)}"]`)) r.__members=getCheckedPeople(key); });
  }
  function p8ValidateBulk(mark=true){
    const w=APP.state.bulkWizard; if(!w) return [];
    const cfg=P8_CONFIG[w.kind], errors=[];
    const seenKpiKeys=new Set();
    const existingKpiKeys=new Set((APP.data.kpiMonths||[]).map(k=>`${k['Mã nhân sự']}|${p8MonthValue(k['Kỳ'])}`));
    w.rows.forEach((r,i)=>{
      r.__errors=[]; r.__fieldErrors={};
      (cfg.required||[]).forEach(f=>{ if(!String(r[f]??'').trim()){ r.__errors.push('Thiếu '+f); r.__fieldErrors[f]=true; } });
      if(w.kind==='projects'&&parseDate(r['Ngày bắt đầu'])&&parseDate(r['Ngày dự kiến kết thúc'])&&parseDate(r['Ngày dự kiến kết thúc'])<parseDate(r['Ngày bắt đầu'])){ r.__errors.push('Ngày dự kiến kết thúc phải từ ngày bắt đầu trở đi.'); r.__fieldErrors['Ngày dự kiến kết thúc']=true; }
      if(w.kind==='employees'&&r['Email']&&!/^\S+@\S+\.\S+$/.test(String(r['Email']))){ r.__errors.push('Email không đúng định dạng.'); r.__fieldErrors['Email']=true; }
      if(w.kind==='users'&&w.mode==='create'&&!String(r['Mật khẩu']||'').trim()){ r.__errors.push('Tài khoản mới bắt buộc có mật khẩu.'); r.__fieldErrors['Mật khẩu']=true; }
      if(w.kind==='files'&&!(r.__files||[]).length){ r.__errors.push('Chưa chọn file upload.'); }

      if(w.kind==='kpiTemplates'){
        const details=r.__details||[];
        if(!details.length) r.__errors.push('Mẫu KPI phải có ít nhất 1 Chỉ tiêu mẫu KPI.');
        const names=new Set();
        details.forEach((d,di)=>{
          const prefix=`Chỉ tiêu ${di+1}: `;
          if(!String(d['Tên chỉ tiêu']||'').trim()) r.__errors.push(prefix+'thiếu Tên chỉ tiêu.');
          if(!String(d['Nhóm KPI']||'').trim()) r.__errors.push(prefix+'thiếu Nhóm KPI.');
          if(!String(d['Đơn vị tính']||'').trim()) r.__errors.push(prefix+'thiếu Đơn vị tính.');
          if(d['Mục tiêu mặc định']===''||!isFinite(Number(d['Mục tiêu mặc định']))) r.__errors.push(prefix+'Mục tiêu mặc định không hợp lệ.');
          const weight=Number(d['Trọng số (%)']);
          if(!isFinite(weight)||weight<=0||weight>100) r.__errors.push(prefix+'Trọng số phải lớn hơn 0 và không vượt 100%.');
          p8ApplyKpiSource(d,false);
          if(!String(d['Chỉ số nguồn']||'').trim()) r.__errors.push(prefix+'thiếu Nguồn đo lường.');
          if(!String(d['Cách ghi nhận']||'').trim()) r.__errors.push(prefix+'chưa xác định được Cách ghi nhận.');
          d['Điểm tối đa']=120;
          const nk=normalizeText(d['Tên chỉ tiêu']);
          if(nk){
            if(names.has(nk)) r.__errors.push(prefix+'Tên chỉ tiêu bị trùng trong cùng mẫu KPI.');
            names.add(nk);
          }
        });
        const rawWeight=details.filter(d=>(d['Trạng thái']||'Đang áp dụng')==='Đang áp dụng').reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0);
        if(Math.abs(rawWeight-100)>0.01) r.__errors.push(`Tổng trọng số Chỉ tiêu mẫu KPI đang áp dụng hiện là ${round1(rawWeight)}%, phải bằng 100%.`);
      }

      if(w.kind==='kpiMonths'){
        const period=p8MonthValue(r['Kỳ']);
        if(!period||!/^[0-9]{4}-[0-9]{2}$/.test(period)){r.__errors.push('Kỳ KPI không hợp lệ.');r.__fieldErrors['Kỳ']=true;}
        const template=(APP.data.kpiTemplates||[]).find(t=>t['Mã mẫu KPI']===r['Mã mẫu KPI']&&t['Trạng thái']==='Đang áp dụng');
        if(r['Mã mẫu KPI']&&!template){r.__errors.push('Mẫu KPI không tồn tại hoặc đã ngừng áp dụng.');r.__fieldErrors['Mã mẫu KPI']=true;}
        if(template){
          const details=(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===template['Mã mẫu KPI']&&d['Trạng thái']!=='Ngừng áp dụng');
          const weight=details.reduce((s,d)=>s+Number(d['Trọng số (%)']||0),0);
          if(!details.length){r.__errors.push('Mẫu KPI chưa có Chỉ tiêu mẫu KPI đang áp dụng.');r.__fieldErrors['Mã mẫu KPI']=true;}
          else if(Math.abs(weight-100)>0.01){r.__errors.push(`Mẫu KPI có tổng trọng số ${round1(weight)}%, cần bằng 100% trước khi tạo KPI tháng.`);r.__fieldErrors['Mã mẫu KPI']=true;}
        }
        if(r['Mã nhân sự']&&period){
          const key=`${r['Mã nhân sự']}|${period}`;
          if(seenKpiKeys.has(key)){r.__errors.push('Nhân sự và kỳ KPI bị trùng trong danh sách đang nhập.');r.__fieldErrors['Mã nhân sự']=true;}
          seenKpiKeys.add(key);
          if(w.mode==='create'&&existingKpiKeys.has(key)){r.__errors.push('Nhân sự đã có KPI trong kỳ này trên database.');r.__fieldErrors['Mã nhân sự']=true;}
        }
      }

      if(r.__errors.length) errors.push(`Dòng ${i+1}: ${r.__errors[0]}`);
    });
    if(mark) w.errors=errors;
    return errors;
  }
  function p8BulkNext(){
    p8SyncBulkFromDom();
    const w=APP.state.bulkWizard;if(!w)return;
    const total=w.kind==='kpiTemplates'?3:2;
    w.step=Math.min(total,(Number(w.step)||1)+1);
    renderBulkCrudWizard();
  }
  function p8BulkBack(){
    p8SyncBulkFromDom();
    const w=APP.state.bulkWizard;if(!w)return;
    w.step=Math.max(1,(Number(w.step)||1)-1);
    renderBulkCrudWizard();
  }
  function p8BulkGoto(step){
    p8SyncBulkFromDom();
    const w=APP.state.bulkWizard;if(!w)return;
    const total=w.kind==='kpiTemplates'?3:2;
    w.step=Math.max(1,Math.min(total,Number(step)||1));
    renderBulkCrudWizard();
  }
  function p8BulkAdd(n){ const w=APP.state.bulkWizard; if(!w||w.mode!=='create')return; p8SyncBulkFromDom(); for(let i=0;i<n;i++)w.rows.push(p8BlankRow(w.kind)); renderBulkCrudWizard(); }
  function p8BulkRemoveEmpty(){ const w=APP.state.bulkWizard; if(!w||w.mode!=='create')return; p8SyncBulkFromDom(); const primary=P8_CONFIG[w.kind].primary; w.rows=w.rows.filter(r=>String(r[primary]||'').trim() || (r.__files||[]).length || (r.__members||[]).length); if(!w.rows.length)w.rows=[p8BlankRow(w.kind)]; renderBulkCrudWizard(); }
  function p8BulkSetExpanded(v){ const w=APP.state.bulkWizard;if(!w)return; p8SyncBulkFromDom(); w.rows.forEach(r=>r.__expanded=v); renderBulkCrudWizard(); }
  function p8BulkRowAction(action,tempId){
    const w=APP.state.bulkWizard;if(!w)return;
    p8SyncBulkFromDom();
    const r=w.rows.find(x=>x.__tempId===tempId);
    if(action==='toggle'&&r)r.__expanded=!r.__expanded;
    if(action==='delete'&&w.mode==='create')w.rows=w.rows.filter(x=>x.__tempId!==tempId);
    if(action==='duplicate'&&w.mode==='create'&&r){
      const copy=JSON.parse(JSON.stringify(r));
      copy.__tempId=p8Uid('row');
      copy.__errors=[];copy.__fieldErrors={};
      const idf=bulkIdField(w.kind);if(idf)copy[idf]='';
      if(w.kind==='employees'){
        copy.__files=[];copy.__avatarFile=null;copy.__avatarPreview='';copy['Ảnh đại diện URL']='';
      }else{
        copy.__files=[...(r.__files||[])];
      }
      if(w.kind==='kpiTemplates'){
        copy.__details=(copy.__details||[]).map(d=>p8BlankKpiDetail(Object.assign({},d,{'Mã chỉ tiêu mẫu':'',__detailTempId:p8Uid('ctkpi')})));
      }
      w.rows.push(copy);
    }
    if(!w.rows.length)w.rows=[p8BlankRow(w.kind)];
    renderBulkCrudWizard();
  }
  function p8BulkSetFiles(tempId,files){ const w=APP.state.bulkWizard;if(!w)return; const r=w.rows.find(x=>x.__tempId===tempId); if(!r)return; r.__files=mergeFileLists(r.__files||[],files||[],P8_MAX_FILE_SIZE); renderBulkCrudWizard(); }
  function p8BulkRemoveFile(tempId,index){ const w=APP.state.bulkWizard;if(!w)return; const r=w.rows.find(x=>x.__tempId===tempId); if(!r)return; r.__files.splice(Number(index),1); renderBulkCrudWizard(); }
  async function p8BulkSave(){
    const w=APP.state.bulkWizard;if(!w)return;
    p8SyncBulkFromDom();
    const errors=p8ValidateBulk(true);
    if(errors.length){
      w.step=2;renderBulkCrudWizard();
      showToast('Chưa thể lưu',errors.slice(0,4).join(' · '),'error',6500);
      return;
    }
    const cfg=P8_CONFIG[w.kind];
    const workRows=w.rows.map(r=>Object.assign({},r,{
      __files:[...(r.__files||[])],
      __members:[...(r.__members||[])],
      __avatarFile:r.__avatarFile||null,
      __avatarPreview:r.__avatarPreview||'',
      __details:(r.__details||[]).map(d=>Object.assign({},d))
    }));
    forceCloseDataModal();
    const t=showToast('Đang xử lý',`${cfg.saveText}: 0/${workRows.length}`,'processing',0);
    try{
      for(let i=0;i<workRows.length;i++){
        const source=workRows[i];
        const r=Object.assign({},source);
        const files=source.__files||[], members=source.__members||[], avatarFile=source.__avatarFile||null, details=source.__details||[];
        delete r.__tempId;delete r.__expanded;delete r.__errors;delete r.__fieldErrors;delete r.__files;delete r.__members;delete r.__avatarFile;delete r.__avatarPreview;delete r.__details;
        updateToast(t,'Đang xử lý',`${cfg.saveText}: ${i+1}/${workRows.length} · ${p8RowTitle(w.kind,source)}`,'processing',0);

        if(w.kind==='projects'){
          const res=await gas('saveRecord','projects',r,APP.token,{timeout:60000});mergeDataResult(res);
          const id=res.id||r['Mã dự án'];
          const m=members.filter(x=>x!==r['Mã người phụ trách']).map(employeeId=>({employeeId,role:'Thành viên',joinDate:r['Ngày bắt đầu'],status:r['Trạng thái']==='Hoàn thành'?'Đã kết thúc':'Đang tham gia'}));
          const mr=await gas('saveProjectMembers',id,m,APP.token,{timeout:60000});mergeDataResult(mr);
          for(const f of files)await uploadOneFile(f,'Dự án',id,(APP.data.categories?.['Loại tài liệu']||[])[0]||'Tài liệu khác','');
        }else if(w.kind==='employees'){
          r['Số điện thoại']=normalizePhoneForSave(r['Số điện thoại']);
          const res=await gas('saveRecord','employees',r,APP.token,{timeout:60000});mergeDataResult(res);
          const id=res.id||r['Mã nhân sự'];
          if(avatarFile){
            const ar=await uploadOneFile(avatarFile,'Nhân sự',id,'Ảnh đại diện nhân sự','Ảnh đại diện hồ sơ nhân sự');
            const fileId=ar?.file?.['File ID']||ar?.file?.fileId||'';
            if(fileId){
              const emp=(APP.data.employees||[]).find(x=>x['Mã nhân sự']===id);
              if(emp)emp['Ảnh đại diện URL']='drive-file:'+fileId;
              APP.state.avatarCache=APP.state.avatarCache||{};
              if(source.__avatarPreview)APP.state.avatarCache[fileId]=source.__avatarPreview;
            }
          }
          for(const f of files)await uploadOneFile(f,'Nhân sự',id,'Hồ sơ nhân sự','');
        }else if(w.kind==='users'){
          const res=await gas('saveRecord','users',r,APP.token,{timeout:60000});mergeDataResult(res);
        }else if(w.kind==='kpiTemplates'){
          const cleanDetails=details.map(d=>{
            const x=Object.assign({},d);
            delete x.__detailTempId;
            delete x.__detailExpanded;
            return x;
          });
          const res=await gas('saveKpiTemplateBundle',r,cleanDetails,APP.token,{timeout:120000});mergeDataResult(res);
        }else if(w.kind==='kpiMonths'){
          const res=await gas('createKpiMonth',r['Mã nhân sự'],r['Mã mẫu KPI'],r['Kỳ'],APP.token,{timeout:90000});mergeDataResult(res);
        }else if(w.kind==='files'){
          for(const f of files)await uploadOneFile(f,r['Module liên quan'],r['Mã bản ghi liên quan'],r['Loại tài liệu'],r['Ghi chú']);
        }
      }
      updateToast(t,'Đã lưu thành công',`${cfg.saveText} hoàn tất cho ${workRows.length} bản ghi.`,'success',4200);
      setUserShell();
      renderCurrentPage();
    }catch(err){
      updateToast(t,'Không thể lưu',err.message,'error',7500);
      renderCurrentPage();
    }
  }


  closeModal=function(){ APP.state.bulkWizard=null; if(P8_BASE_CLOSE_MODAL) return P8_BASE_CLOSE_MODAL(); document.getElementById('modal-root').innerHTML=''; };
  routeAction=async function(action,el,e){
    if(action==='new-project') return openBulkCrudWizard('projects',el?.dataset?.id||'');
    if(action==='edit-project') return openBulkCrudWizard('projects',el.dataset.id||'');
    if(action==='new-employee') return openBulkCrudWizard('employees',el?.dataset?.id||'');
    if(action==='edit-employee') return openBulkCrudWizard('employees',el.dataset.id||'');
    if(action==='new-user') return openBulkCrudWizard('users',el?.dataset?.id||'');
    if(action==='edit-user') return openBulkCrudWizard('users',el.dataset.id||'');
    if(action==='new-template') return openBulkCrudWizard('kpiTemplates',el?.dataset?.id||'');
    if(action==='edit-template') return openBulkCrudWizard('kpiTemplates',el.dataset.id||'');
    if(action==='new-kpi') return openBulkCrudWizard('kpiMonths');
    if(action==='upload-file') return openBulkCrudWizard('files');
    if(APP.state.bulkWizard){
      if(action==='bulk-step')return p8BulkGoto(el.dataset.step); if(action==='bulk-next')return p8BulkNext(); if(action==='bulk-back')return p8BulkBack(); if(action==='bulk-save')return p8BulkSave();
      if(action==='bulk-add-one')return p8BulkAdd(1); if(action==='bulk-add-five')return p8BulkAdd(5); if(action==='bulk-remove-empty')return p8BulkRemoveEmpty(); if(action==='bulk-collapse')return p8BulkSetExpanded(false); if(action==='bulk-expand')return p8BulkSetExpanded(true);
      if(action==='bulk-row-toggle')return p8BulkRowAction('toggle',el.dataset.tempid); if(action==='bulk-row-delete')return p8BulkRowAction('delete',el.dataset.tempid); if(action==='bulk-row-duplicate')return p8BulkRowAction('duplicate',el.dataset.tempid);
      if(action==='kpi-detail-add-one')return p8AddKpiDetails(el.dataset.templateTempid,1);
      if(action==='kpi-detail-add-five')return p8AddKpiDetails(el.dataset.templateTempid,5);
      if(action==='kpi-detail-balance')return p8BalanceKpiWeights(el.dataset.templateTempid);
      if(action==='kpi-detail-remove-empty')return p8RemoveEmptyKpiDetails(el.dataset.templateTempid);
      if(action==='kpi-detail-collapse-all')return p8SetKpiDetailsExpanded(el.dataset.templateTempid,false);
      if(action==='kpi-detail-expand-all')return p8SetKpiDetailsExpanded(el.dataset.templateTempid,true);
      if(action==='kpi-detail-toggle')return p8KpiDetailRowAction('toggle',el.dataset.templateTempid,el.dataset.detailTempid);
      if(action==='kpi-detail-duplicate')return p8KpiDetailRowAction('duplicate',el.dataset.templateTempid,el.dataset.detailTempid);
      if(action==='kpi-detail-delete')return p8KpiDetailRowAction('delete',el.dataset.templateTempid,el.dataset.detailTempid);
      if(action==='employee-avatar-trigger')return document.querySelector(`input[data-employee-avatar-file="${el.dataset.tempid}"]`)?.click();
      if(action==='employee-avatar-clear')return p8EmployeeClearAvatar(el.dataset.tempid);
      if(action==='employee-avatar-preview')return previewUploadedFile(el.dataset.fileid,'');
      if(action==='employee-doc-file-trigger')return document.querySelector(`input[data-employee-doc-file="${el.dataset.tempid}"]`)?.click();
      if(action==='employee-doc-file-remove')return p8BulkRemoveFile(el.dataset.tempid,el.dataset.fileindex);
      if(action==='bulk-file-trigger')return document.querySelector(`input[data-bulk-file="${el.dataset.tempid}"]`)?.click(); if(action==='bulk-file-remove')return p8BulkRemoveFile(el.dataset.tempid,el.dataset.fileindex);
    }
    if(P8_BASE_ROUTE_ACTION) return P8_BASE_ROUTE_ACTION(action,el,e);
  };
  openProjectModal=function(id=''){return openBulkCrudWizard('projects',id);};
  openEmployeeModal=function(id=''){return openBulkCrudWizard('employees',id);};
  openUserModal=function(id=''){return openBulkCrudWizard('users',id);};
  openKpiTemplateModal=function(id=''){return openBulkCrudWizard('kpiTemplates',id);};
  openCreateKpiModal=function(){return openBulkCrudWizard('kpiMonths');};
  openUploadModal=function(){return openBulkCrudWizard('files');};

  document.addEventListener('input',function(e){
    const b=e.target.closest('[data-bulk-field]');
    if(b&&APP.state.bulkWizard){
      const r=APP.state.bulkWizard.rows.find(x=>x.__tempId===b.dataset.tempid);
      if(r)r[b.dataset.bulkField]=b.value;
    }
    const kd=e.target.closest('[data-kpi-detail-field]');
    if(kd&&APP.state.bulkWizard?.kind==='kpiTemplates'){
      const r=APP.state.bulkWizard.rows.find(x=>x.__tempId===kd.dataset.templateTempid);
      const d=(r?.__details||[]).find(x=>x.__detailTempId===kd.dataset.detailTempid);
      if(d){
        const f=kd.dataset.kpiDetailField;
        d[f]=['Mục tiêu mặc định','Trọng số (%)','Điểm tối đa'].includes(f)?(kd.value===''?'':Number(kd.value)):kd.value;
        if(f==='Chỉ số nguồn')p8ApplyKpiSource(d,true); else d['Điểm tối đa']=120;
        if(f==='Trọng số (%)')p8UpdateKpiWeightUI(r);
      }
    }
  },true);
  document.addEventListener('change',function(e){
    if(e.target.matches('[data-bulk-file]')) return p8BulkSetFiles(e.target.dataset.bulkFile,[...e.target.files]);
    if(e.target.matches('[data-employee-avatar-file]')) return p8EmployeeSetAvatar(e.target.dataset.employeeAvatarFile,e.target.files?.[0]);
    if(e.target.matches('[data-employee-doc-file]')) return p8BulkSetFiles(e.target.dataset.employeeDocFile,[...e.target.files]);

    const b=e.target.closest('[data-bulk-field]');
    if(b&&APP.state.bulkWizard){
      const w=APP.state.bulkWizard, r=w.rows.find(x=>x.__tempId===b.dataset.tempid);
      if(r){
        r[b.dataset.bulkField]=b.value;
        if(w.kind==='users'&&b.dataset.bulkField==='Vai trò'){
          r['Phạm vi dữ liệu']=roleScope(b.value);
          setTimeout(()=>{if(APP.state.bulkWizard===w)renderBulkCrudWizard();},0);
        }
        if(w.kind==='kpiTemplates'&&b.dataset.bulkField==='Phạm vi áp dụng'){
          const allowed=p8KpiScopeOptions(r).map(o=>String(typeof o==='string'?o:o.value));
          if(r['Giá trị áp dụng']&&!allowed.includes(String(r['Giá trị áp dụng'])))r['Giá trị áp dụng']='';
          setTimeout(()=>{if(APP.state.bulkWizard===w)renderBulkCrudWizard();},0);
        }
        if(w.kind==='kpiMonths'&&b.dataset.bulkField==='Mã nhân sự'){
          p8AutoSuggestKpiTemplate(r);
          setTimeout(()=>{if(APP.state.bulkWizard===w)renderBulkCrudWizard();},0);
        }else if(w.kind==='kpiMonths'&&b.dataset.bulkField==='Mã mẫu KPI'){
          setTimeout(()=>{if(APP.state.bulkWizard===w)renderBulkCrudWizard();},0);
        }
      }
    }

    const kd=e.target.closest('[data-kpi-detail-field]');
    if(kd&&APP.state.bulkWizard?.kind==='kpiTemplates'){
      const r=APP.state.bulkWizard.rows.find(x=>x.__tempId===kd.dataset.templateTempid);
      const d=(r?.__details||[]).find(x=>x.__detailTempId===kd.dataset.detailTempid);
      if(d){
        const f=kd.dataset.kpiDetailField;
        d[f]=['Mục tiêu mặc định','Trọng số (%)','Điểm tối đa'].includes(f)?(kd.value===''?'':Number(kd.value)):kd.value;
        if(f==='Chỉ số nguồn'){p8ApplyKpiSource(d,true);setTimeout(()=>{if(APP.state.bulkWizard)renderBulkCrudWizard();},0);} else d['Điểm tối đa']=120;
        p8UpdateKpiWeightUI(r);
      }
    }

    if(e.target.matches('[data-multi-person]')){
      const key=e.target.dataset.multiPerson;
      if(APP.state.bulkWizard && key?.startsWith('bulk-members-')){const tempId=key.replace('bulk-members-','');const r=APP.state.bulkWizard.rows.find(x=>x.__tempId===tempId);if(r)r.__members=getCheckedPeople(key);}
    }
  },true);
  document.addEventListener('click',function(e){
    const step=e.target.closest('.smart-step');
    if(!step || step.dataset.action) return;
    const steps=[...step.parentElement.querySelectorAll('.smart-step')]; const idx=steps.indexOf(step)+1;
    if(APP.state.wizard && typeof renderTaskWizard==='function'){ APP.state.wizard.step=idx; renderTaskWizard(); }
  },true);
})();



/* ===================== PATCH 9 - CRUD/UPLOAD/AVATAR STABILITY ===================== */
function mergeFileLists(current, incoming, maxBytes){
  const out=[...(current||[])];
  (incoming||[]).forEach(f=>{
    if(!f)return;
    if(maxBytes && f.size>maxBytes){showToast('File quá lớn',`${f.name} vượt giới hạn ${Math.round(maxBytes/1024/1024)} MB.`,'warning');return;}
    const key=[f.name,f.size,f.lastModified||0].join('|');
    if(!out.some(x=>[x.name,x.size,x.lastModified||0].join('|')===key))out.push(f);
  });
  return out;
}
function forceCloseDataModal(){
  APP.state.bulkWizard=null;APP.state.formWizard=null;APP.state.wizard=null;APP.state.pendingFiles=[];
  const root=document.getElementById('modal-root'); if(root)root.innerHTML='';
}
function employeeDirectAvatarSrc(e){
  const raw=String(e?.['Ảnh đại diện URL']||'').trim();
  if(!raw || /^drive-file:/i.test(raw))return '';
  if(/^data:image\//i.test(raw))return raw;
  if(/^https?:\/\//i.test(raw) && !/drive\.google\.com\/file\/d\//i.test(raw))return raw;
  return '';
}
multiPersonPicker=function(key,selected,hint){
  const set=new Set((selected||[]).map(String));
  const employees=APP.data.employees||[];
  const allSelected=employees.length>0&&employees.every(e=>set.has(String(e['Mã nhân sự']||'')));
  const chips=[...set].map(id=>`<span class="person-chip">${avatarHtml(id,24)}<span>${escapeHtml(employeeName(id))}</span></span>`).join('');
  const options=employees.map(e=>`<label class="multi-option" data-search="${escapeAttr(normalizeText(e['Mã nhân sự']+' '+e['Họ và tên']+' '+e['Nhóm']))}"><input class="check" type="checkbox" data-multi-person="${escapeAttr(key)}" value="${escapeAttr(e['Mã nhân sự'])}" ${set.has(String(e['Mã nhân sự']||''))?'checked':''}>${avatarHtml(e['Mã nhân sự'],26)}<span><strong>${escapeHtml(e['Họ và tên'])}</strong><small>${escapeHtml(e['Mã nhân sự'])} · ${escapeHtml(e['Nhóm']||'')}</small></span></label>`).join('');
  return `<div class="selected-chips">${chips}</div><div class="multi-select-list refined-multi-select"><div class="multi-select-search"><span class="material-symbols-rounded">search</span><input data-multi-search="${escapeAttr(key)}" placeholder="Tìm nhân sự theo mã, tên hoặc Nhóm..."></div><label class="multi-select-all-row"><input class="check" type="checkbox" data-multi-all="${escapeAttr(key)}" ${allSelected?'checked':''}><span><strong>Chọn tất cả thành viên</strong><small>Chọn hoặc bỏ chọn toàn bộ ${employees.length} thành viên</small></span></label><div class="multi-options" data-multi-options="${escapeAttr(key)}">${options}</div></div><div class="field-help">${escapeHtml(hint||'Có thể chọn nhiều nhân sự.')}</div>`;
};

renderTasksTable=function(rows,module='tasks',selectable=true){
  if(!rows.length)return emptyState('task_alt','Không có công việc','Không tìm thấy công việc phù hợp với kỳ hoặc bộ lọc đang chọn.');
  const state=visibleSelectionState(module,rows);
  return `<div class="data-table-wrap"><table class="data-table" style="min-width:1160px"><thead><tr>${selectable?`<th style="width:42px"><input class="check" type="checkbox" data-select-all data-module="${module}" ${state.all?'checked':''} data-selection-some="${state.some?'1':'0'}"></th>`:''}<th style="width:140px">Thao tác</th><th>Công việc</th><th>Dự án</th><th>Người phụ trách</th><th>Thời gian</th><th>Ưu tiên</th><th>Trạng thái</th><th>Tiến độ</th></tr></thead><tbody>${rows.map(t=>`<tr>${selectable?`<td><input class="check" type="checkbox" data-row-select data-module="${module}" data-id="${t['Mã công việc']}" ${isSelected(module,t['Mã công việc'])?'checked':''}></td>`:''}<td><div class="row-actions"><button class="row-action" data-action="view-task" data-id="${t['Mã công việc']}" title="Xem hồ sơ"><span class="material-symbols-rounded">visibility</span></button>${canEditTask(t)?`<button class="row-action" data-action="edit-task" data-id="${t['Mã công việc']}" title="Sửa"><span class="material-symbols-rounded">edit</span></button>`:''}${t['Trạng thái']==='Chờ xác nhận'&&APP.permissions.canConfirmTask?`<button class="row-action" data-action="confirm-task" data-id="${t['Mã công việc']}" title="Xác nhận"><span class="material-symbols-rounded">fact_check</span></button>`:`<button class="row-action" data-action="task-status" data-id="${t['Mã công việc']}" title="Cập nhật trạng thái"><span class="material-symbols-rounded">sync_alt</span></button>`}${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-task" data-id="${t['Mã công việc']}" title="Xóa công việc"><span class="material-symbols-rounded">delete</span></button>`:''}</div></td><td class="main-cell"><strong>${escapeHtml(t['Tên công việc'])}</strong><small>${escapeHtml(t['Mã công việc'])} · ${escapeHtml(t['Nhóm công việc'])}</small></td><td><strong style="font-size:11.5px">${escapeHtml(projectName(t['Mã dự án']))}</strong><small style="display:block;color:var(--muted)">${escapeHtml(t['Mã dự án'])}</small></td><td>${personInline(t['Mã người phụ trách'])}</td><td class="${isTaskOverdue(t)?'text-danger':''}"><strong style="font-size:11.5px">${formatDate(t['Ngày bắt đầu'])||'-'}</strong><small style="display:block;color:var(--muted)">đến ${formatDate(t['Hạn hoàn thành'])||'-'}</small>${isTaskOverdue(t)?'<small style="display:block">Quá hạn</small>':''}</td><td>${statusBadge(t['Mức độ ưu tiên'])}</td><td>${statusBadge(isTaskOverdue(t)?'Quá hạn':t['Trạng thái'])}</td><td><div style="min-width:95px"><div class="progress"><span style="width:${clamp(Number(t['Tiến độ (%)']||0),0,100)}%"></span></div><small style="display:block;margin-top:3px;color:var(--muted)">${round1(t['Tiến độ (%)']||0)}%</small></div></td></tr>`).join('')}</tbody></table></div>`;
};



/* ===== Stability helpers: phone, selection and lazy employee avatars ===== */
function normalizePhoneForSave(v){
  let s=String(v??'').trim();
  if(!s)return '';
  const hadPlus84=/^\+?84/.test(s.replace(/\s+/g,''));
  s=s.replace(/\D/g,'');
  if(hadPlus84&&s.startsWith('84'))s='0'+s.slice(2);
  else if(s&&!s.startsWith('0'))s='0'+s;
  return s;
}
function syncSelectAllCheckboxes(){
  document.querySelectorAll('[data-select-all]').forEach(el=>{
    const some=el.dataset.selectionSome==='1';
    el.indeterminate=some&&!el.checked;
  });
}
let EMPLOYEE_AVATAR_OBSERVER=null;
const EMPLOYEE_AVATAR_QUEUE=[];
let EMPLOYEE_AVATAR_ACTIVE=0;
function initLazyEmployeeAvatars(root=document){
  if(!root?.querySelectorAll)return;
  APP.state.avatarCache=APP.state.avatarCache||{};
  if(!EMPLOYEE_AVATAR_OBSERVER&&'IntersectionObserver'in window){
    EMPLOYEE_AVATAR_OBSERVER=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          EMPLOYEE_AVATAR_OBSERVER.unobserve(entry.target);
          queueLazyEmployeeAvatar(entry.target);
        }
      });
    },{rootMargin:'180px'});
  }
  root.querySelectorAll('.avatar-lazy:not([data-avatar-bound])').forEach(el=>{
    el.dataset.avatarBound='1';
    const fileId=el.dataset.avatarFileId||'';
    if(fileId&&APP.state.avatarCache[fileId]){
      applyLazyAvatarData(el,APP.state.avatarCache[fileId]);
      return;
    }
    if(EMPLOYEE_AVATAR_OBSERVER)EMPLOYEE_AVATAR_OBSERVER.observe(el);
    else queueLazyEmployeeAvatar(el);
  });
}
function queueLazyEmployeeAvatar(el){
  if(!el||el.dataset.avatarQueued==='1'||el.dataset.avatarLoaded==='1')return;
  el.dataset.avatarQueued='1';
  EMPLOYEE_AVATAR_QUEUE.push(el);
  pumpLazyEmployeeAvatars();
}
function pumpLazyEmployeeAvatars(){
  while(EMPLOYEE_AVATAR_ACTIVE<2&&EMPLOYEE_AVATAR_QUEUE.length){
    const el=EMPLOYEE_AVATAR_QUEUE.shift();
    if(!el||!document.contains(el)){continue;}
    const fileId=el.dataset.avatarFileId||'';
    if(!fileId){el.dataset.avatarLoaded='1';continue;}
    EMPLOYEE_AVATAR_ACTIVE++;
    el.classList.add('avatar-loading');
    const cached=APP.state.avatarCache?.[fileId];
    const job=cached?Promise.resolve({previewable:true,mode:'image',dataUrl:cached}):gas('getFilePreviewDataUrl',fileId,APP.token,{timeout:60000});
    job.then(res=>{
      if(res?.previewable&&res.mode==='image'&&res.dataUrl){
        APP.state.avatarCache[fileId]=res.dataUrl;
        if(document.contains(el))applyLazyAvatarData(el,res.dataUrl);
      }else if(document.contains(el)){
        el.dataset.avatarLoaded='1';el.classList.remove('avatar-loading');
      }
    }).catch(()=>{
      if(document.contains(el)){el.dataset.avatarLoaded='1';el.classList.remove('avatar-loading');}
    }).finally(()=>{
      EMPLOYEE_AVATAR_ACTIVE=Math.max(0,EMPLOYEE_AVATAR_ACTIVE-1);
      pumpLazyEmployeeAvatars();
    });
  }
}
function applyLazyAvatarData(el,dataUrl){
  if(!el||!dataUrl)return;
  const name=el.getAttribute('title')||'Nhân sự';
  el.innerHTML=`<img src="${escapeAttr(dataUrl)}" alt="${escapeAttr(name)}">`;
  el.dataset.avatarLoaded='1';
  el.classList.remove('avatar-loading');
}


/* ===================== KPI SME V2 — SELF ASSESSMENT + MANAGER APPROVAL ===================== */
(function(){
  const KPI_MAX=120;
  function kpiIsOfficial(k){return ['Đã đánh giá','Đã chốt'].includes(String(k?.['Trạng thái KPI']||''));}
  function kpiTempScore(k){
    const v=Number(k?.['Điểm tạm tính']);
    if(Number.isFinite(v))return v;
    const details=kpiDetails(k?.['Mã KPI tháng']),applicable=details.filter(d=>d['Trạng thái']!=='Không áp dụng');
    const weight=applicable.reduce((sum,d)=>sum+Number(d['Trọng số (%)']||0),0);
    const raw=applicable.reduce((sum,d)=>sum+Number(d['Điểm quy đổi']||0),0);
    return weight?Math.min(KPI_MAX,round1(raw*100/weight)):0;
  }
  function kpiDisplayScore(k){return kpiIsOfficial(k)?Number(k['Tổng điểm KPI']||0):kpiTempScore(k);}
  function kpiSourceRuleFrontend(d){
    const rules=APP.data.kpiSourceRules||{};
    return rules[d?.['Chỉ số nguồn']]||{label:d?.['Nguồn số liệu']||'Nguồn KPI'};
  }
  function kpiActualText(v,unit=''){
    if(v===''||v===null||v===undefined||!Number.isFinite(Number(v)))return 'N/A';
    return `${round1(Number(v))}${unit?' '+escapeHtml(unit):''}`;
  }
  function canSelfKpi(k){return Boolean(APP.permissions.canSelfEvaluateKpi&&APP.session?.employeeId&&String(k?.['Mã nhân sự'])===String(APP.session.employeeId)&&!['Đã đánh giá','Đã chốt'].includes(k?.['Trạng thái KPI']));}
  function kpiScoreLabel(k){return kpiIsOfficial(k)?'Điểm được duyệt':'Điểm tạm tính';}

  renderKpiMonth=function(){
    const module='kpiMonths';let rows=periodFilter(APP.data.kpiMonths||[],'Kỳ');rows=applySearchFilter(module,rows,['Mã KPI tháng','Mã nhân sự','Trạng thái KPI','Xếp loại']);rows=applyGenericFilters(module,rows);rows=sortRows(module,rows,'Kỳ');
    const actions=[APP.permissions.canEvaluateKpi?`<button class="btn btn-primary" data-action="new-kpi"><span class="material-symbols-rounded">add</span>Tạo KPI tháng</button>`:'',`<button class="btn" data-action="export-xlsx" data-module="kpiMonths"><span class="material-symbols-rounded">download</span>Export</button>`].join('');
    const toolbar=moduleToolbar(module,[['Trạng thái KPI',APP.data.fixedOptions?.kpiStatus||[]],['Xếp loại',['Vượt mục tiêu','Tốt','Đạt','Cần cải thiện','Chưa đạt']]],'',true);
    document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('KPI tháng','Trần điểm cố định 120%. Chỉ tiêu tự động lấy từ hệ thống; chỉ tiêu tự nhập do Nhóm tự đánh giá và chỉ được tính chính thức sau khi quản lý duyệt.',actions)}${toolbar}<div class="panel table-panel">${APP.state.view.kpi==='cards'?renderKpiCards(paginate(module,rows)):renderKpiTable(paginate(module,rows))}${tableFooter(module,rows.length)}</div></div>`;
  };

  renderKpiCards=function(rows){
    if(!rows.length)return emptyState('speed','Chưa có KPI trong kỳ','Quản lý có thể tạo KPI tháng từ mẫu KPI đang áp dụng.');
    return `<div class="card-grid kpi-month-grid" style="padding:10px">${rows.map(k=>{
      const score=kpiDisplayScore(k),official=kpiIsOfficial(k),self=canSelfKpi(k);
      const status=String(k['Trạng thái KPI']||'Đang theo dõi');
      return `<article class="panel entity-card kpi-card-v3"><div class="kpi-card-v3-head"><div class="kpi-card-person">${avatarHtml(k['Mã nhân sự'],42)}<div class="kpi-card-person-copy"><h3>${escapeHtml(employeeName(k['Mã nhân sự']))}</h3><p>${formatPeriod(k['Kỳ'])} · ${escapeHtml(findEmployee(k['Mã nhân sự'])?.['Nhóm']||'')}</p></div></div><div class="kpi-card-status">${statusBadge(status)}</div></div><div class="kpi-card-score-zone"><div class="kpi-card-score-block"><small>${kpiScoreLabel(k)}</small><strong>${round1(score)}<span>/120</span></strong></div><div class="kpi-card-classification">${official?statusBadge(k['Xếp loại']||'Chưa xếp loại'):'<span class="badge badge-gray">Chưa tính chính thức</span>'}</div></div><div class="progress kpi-card-progress"><span style="width:${Math.min(100,Number(score||0)/1.2)}%"></span></div><div class="kpi-card-meta-grid"><div><small>Quản lý đánh giá</small><strong title="${escapeAttr(employeeName(k['Mã quản lý đánh giá'])||'-')}">${escapeHtml(employeeName(k['Mã quản lý đánh giá'])||'-')}</strong></div><div><small>Tự đánh giá</small><strong>${formatDate(k['Ngày tự đánh giá'])||'Chưa gửi'}</strong></div></div><div class="kpi-card-footer"><span>${escapeHtml(k['Mã KPI tháng'])}</span><div class="row-actions"><button class="row-action view" data-action="view-kpi" data-id="${k['Mã KPI tháng']}" title="Xem KPI"><span class="material-symbols-rounded">visibility</span></button>${self?`<button class="row-action self" data-action="self-evaluate-kpi" data-id="${k['Mã KPI tháng']}" title="Tự đánh giá"><span class="material-symbols-rounded">person_edit</span></button>`:''}${APP.permissions.canEvaluateKpi&&k['Trạng thái KPI']!=='Đã chốt'?`<button class="row-action confirm" data-action="evaluate-kpi" data-id="${k['Mã KPI tháng']}" title="Quản lý duyệt"><span class="material-symbols-rounded">fact_check</span></button>`:''}${APP.permissions.canFinalizeKpi&&k['Trạng thái KPI']==='Đã đánh giá'?`<button class="row-action status" data-action="finalize-kpi" data-id="${k['Mã KPI tháng']}" title="Chốt KPI"><span class="material-symbols-rounded">lock</span></button>`:''}${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-kpi" data-id="${k['Mã KPI tháng']}" title="Xóa KPI tháng"><span class="material-symbols-rounded">delete</span></button>`:''}</div></div></article>`;
    }).join('')}</div>`;
  };


  renderKpiTable=function(rows){
    if(!rows.length)return emptyState('speed','Chưa có KPI','Không có dữ liệu KPI phù hợp.');
    return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Thao tác</th><th>Nhân sự</th><th>Kỳ</th><th>Trạng thái</th><th>Điểm hiển thị</th><th>Loại điểm</th><th>Xếp loại</th><th>Ngày chốt</th></tr></thead><tbody>${rows.map(k=>{const score=kpiDisplayScore(k),official=kpiIsOfficial(k);return `<tr><td><div class="row-actions"><button class="row-action" data-action="view-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">visibility</span></button>${canSelfKpi(k)?`<button class="row-action self" data-action="self-evaluate-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">person_edit</span></button>`:''}${APP.permissions.canEvaluateKpi&&k['Trạng thái KPI']!=='Đã chốt'?`<button class="row-action" data-action="evaluate-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">fact_check</span></button>`:''}${APP.permissions.canDelete?`<button class="row-action danger" data-action="delete-kpi" data-id="${k['Mã KPI tháng']}" title="Xóa KPI tháng"><span class="material-symbols-rounded">delete</span></button>`:''}</div></td><td>${personInline(k['Mã nhân sự'])}</td><td>${formatPeriod(k['Kỳ'])}</td><td>${statusBadge(k['Trạng thái KPI'])}</td><td><strong>${round1(score)}</strong> / 120</td><td>${official?'<span class="badge badge-green">Được duyệt</span>':'<span class="badge badge-gray">Tạm tính</span>'}</td><td>${official?statusBadge(k['Xếp loại']||'Chưa xếp loại'):'-'}</td><td>${formatDate(k['Ngày chốt'])||'-'}</td></tr>`}).join('')}</tbody></table></div>`;
  };

  renderKpiEvaluation=function(){
    let rows=periodFilter(APP.data.kpiMonths||[],'Kỳ').filter(k=>k['Trạng thái KPI']!=='Đã chốt'); rows=applySearchFilter('kpiEvaluation',rows,['Mã nhân sự','Trạng thái KPI']);
    rows.sort((a,b)=>Number(b['Trạng thái KPI']==='Chờ quản lý duyệt')-Number(a['Trạng thái KPI']==='Chờ quản lý duyệt'));
    document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Đánh giá KPI','Nhóm tự đánh giá các chỉ tiêu cần nhập; quản lý kiểm tra, điều chỉnh nếu cần và duyệt. Chỉ sau bước duyệt mới hình thành điểm KPI chính thức.')}<div class="panel table-panel">${rows.length?`<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Thao tác</th><th>Nhân sự</th><th>Kỳ</th><th>Trạng thái</th><th>Điểm tạm tính</th><th>Tự đánh giá</th><th>Chỉ tiêu chờ duyệt</th></tr></thead><tbody>${rows.map(k=>{const details=kpiDetails(k['Mã KPI tháng']);const pending=details.filter(d=>d['Nguồn số liệu']==='Nhóm tự nhập'&&d['Trạng thái']!=='Đã duyệt').length,na=details.filter(d=>d['Trạng thái']==='Không áp dụng').length;return `<tr><td><button class="btn btn-sm btn-primary" data-action="evaluate-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">fact_check</span>Duyệt KPI</button></td><td>${personInline(k['Mã nhân sự'])}</td><td>${formatPeriod(k['Kỳ'])}</td><td>${statusBadge(k['Trạng thái KPI'])}</td><td><strong>${round1(kpiTempScore(k))}</strong> / 120</td><td>${formatDate(k['Ngày tự đánh giá'])||'Chưa gửi'}</td><td><span class="badge ${(pending||na)?'badge-orange':'badge-green'}">${na?na+' N/A cần xác nhận':pending?pending+' chỉ tiêu':'Đủ dữ liệu nhập'}</span></td></tr>`}).join('')}</tbody></table></div>`:emptyState('fact_check','Không có KPI chờ đánh giá','Các KPI chưa chốt sẽ hiển thị ở đây.')}</div></div>`;
  };

  renderKpiFinalize=function(){
    const rows=periodFilter(APP.data.kpiMonths||[],'Kỳ').filter(k=>k['Trạng thái KPI']==='Đã đánh giá');
    document.getElementById('page-content').innerHTML=`<div class="page-shell">${pageHead('Chốt KPI','Chỉ chốt KPI đã được quản lý duyệt đầy đủ. Kết quả sau chốt là điểm chính thức cuối kỳ.')}<div class="panel table-panel">${rows.length?`<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Thao tác</th><th>Nhân sự</th><th>Kỳ</th><th>Điểm được duyệt</th><th>Xếp loại</th><th>Nhận xét quản lý</th></tr></thead><tbody>${rows.map(k=>`<tr><td><div class="row-actions"><button class="row-action" data-action="view-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">visibility</span></button><button class="btn btn-sm btn-primary" data-action="finalize-kpi" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">lock</span>Chốt KPI</button></div></td><td>${personInline(k['Mã nhân sự'])}</td><td>${formatPeriod(k['Kỳ'])}</td><td><strong class="${Number(k['Tổng điểm KPI'])>100?'text-success':''}">${round1(k['Tổng điểm KPI']||0)}</strong> /120</td><td>${statusBadge(k['Xếp loại'])}</td><td>${escapeHtml(k['Nhận xét tổng hợp']||'')}</td></tr>`).join('')}</tbody></table></div>`:emptyState('lock_open','Không có KPI chờ chốt','KPI đã được quản lý duyệt sẽ xuất hiện tại đây.')}</div></div>`;
  };

  window.openKpiSelfEvaluationModal=async function(id){
    const synced=await syncAutomaticKpiData(id);if(!synced)return;
    const k=(APP.data.kpiMonths||[]).find(x=>x['Mã KPI tháng']===id);if(!k)return;
    if(!canSelfKpi(k)){showToast('Không thể tự đánh giá','Bạn chỉ được tự đánh giá KPI của chính mình trước khi quản lý duyệt.','warning');return;}
    const details=kpiDetails(id),temp=kpiTempScore(k);
    const cards=details.map(d=>{
      const manual=d['Nguồn số liệu']==='Nhóm tự nhập',rule=kpiSourceRuleFrontend(d),na=d['Trạng thái']==='Không áp dụng';
      return `<article class="kpi-eval-card ${manual?'manual':'auto'}"><div class="kpi-eval-card-head"><div><strong>${escapeHtml(d['Tên chỉ tiêu'])}</strong><small>${escapeHtml(d['Nhóm KPI'])} · ${escapeHtml(rule.label||d['Nguồn số liệu'])}</small></div>${statusBadge(na?'Không áp dụng':manual?'Tự đánh giá':'Tự động')}</div><div class="kpi-eval-metrics"><div class="kpi-eval-metric"><small>Mục tiêu</small><b>${kpiActualText(d['Mục tiêu'],d['Đơn vị tính'])}</b></div><div class="kpi-eval-metric"><small>${manual?'Tự đánh giá':'Hệ thống'}</small><b>${kpiActualText(manual?d['Thực tế tự đánh giá']:d['Thực tế hệ thống'],d['Đơn vị tính'])}</b></div><div class="kpi-eval-metric"><small>Điểm tạm</small><b>${na?'N/A':round1(d['Điểm chỉ tiêu']||0)+'/120'}</b></div><div class="kpi-eval-metric"><small>Trọng số</small><b>${round1(d['Trọng số (%)']||0)}%</b></div></div>${manual?`<div class="kpi-eval-inputs self-inputs"><input type="number" min="0" step="any" data-kpi-self-actual data-kpi-detail-id="${escapeAttr(d['Mã chi tiết KPI'])}" value="${escapeAttr(d['Thực tế tự đánh giá']??'')}" placeholder="Nhập thực tế"><textarea data-kpi-self-comment data-kpi-detail-id="${escapeAttr(d['Mã chi tiết KPI'])}" placeholder="Giải trình / minh chứng...">${escapeHtml(d['Nhận xét nhân sự']||'')}</textarea></div>`:`<div class="kpi-auto-note"><span class="material-symbols-rounded">auto_awesome</span>${na?'Chưa đủ dữ liệu đến thời điểm hiện tại; hệ thống không tự cho 0 điểm.':'Dữ liệu được hệ thống tính tự động và không thể sửa trong tự đánh giá.'}</div>`}</article>`;
    }).join('');
    const body=`<div class="kpi-eval-shell"><div class="kpi-score-hero"><div class="kpi-person-block">${avatarHtml(k['Mã nhân sự'],64)}<div><h2>${escapeHtml(employeeName(k['Mã nhân sự']))}</h2><p>Kỳ ${formatPeriod(k['Kỳ'])} · ${statusBadge(k['Trạng thái KPI'])}</p><div class="kpi-flow-badges"><span class="badge badge-blue">Tự động: ${details.filter(d=>d['Nguồn số liệu']==='Tự động hệ thống').length}</span><span class="badge badge-orange">Tự nhập: ${details.filter(d=>d['Nguồn số liệu']==='Nhóm tự nhập').length}</span><span class="badge badge-violet">Trần 120%</span></div></div></div><div class="kpi-score-panel"><small class="muted">Điểm tạm tính</small><div class="kpi-score-number">${round1(temp)}<small>/120</small></div><div class="progress" style="margin-top:10px"><span style="width:${Math.min(100,temp/1.2)}%"></span></div><small class="kpi-score-warning">Chưa phải điểm chính thức</small></div></div><div class="kpi-eval-grid">${cards}</div><div class="form-field"><label>Nhận xét / giải trình tổng hợp</label><textarea id="kpi-self-overall-comment" placeholder="Tóm tắt kết quả công việc, minh chứng và nội dung cần quản lý xem xét...">${escapeHtml(k['Nhận xét nhân sự']||'')}</textarea></div><input type="hidden" id="kpi-self-id" value="${escapeAttr(id)}"></div>`;
    openModal(modalShell('Tự đánh giá KPI','Nhập kết quả của các chỉ tiêu tự đánh giá. Sau khi gửi, KPI chuyển sang Chờ quản lý duyệt và chưa được tính chính thức.',body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-kpi-self-evaluation"><span class="material-symbols-rounded">send</span>Gửi quản lý duyệt</button>`,'xwide'));
  };

  window.saveKpiSelfEvaluationModal=async function(){
    const id=document.getElementById('kpi-self-id')?.value,comment=document.getElementById('kpi-self-overall-comment')?.value||'',updates=[];
    document.querySelectorAll('[data-kpi-self-actual]').forEach(el=>{const detailId=el.dataset.kpiDetailId;const c=document.querySelector(`[data-kpi-self-comment][data-kpi-detail-id="${CSS.escape(detailId)}"]`);updates.push({id:detailId,actual:el.value,comment:c?.value||''});});
    const t=showToast('Đang gửi tự đánh giá','Dữ liệu sẽ chờ quản lý duyệt trước khi trở thành điểm chính thức.','processing',0);
    try{const res=await gas('submitKpiSelfEvaluation',id,updates,comment,APP.token,{timeout:90000});mergeDataResult(res);closeModal();updateToast(t,'Đã gửi quản lý duyệt','KPI đã chuyển sang trạng thái Chờ quản lý duyệt.','success',4000);renderCurrentPage();}catch(err){updateToast(t,'Không thể gửi tự đánh giá',err.message,'error',6000);}
  };

  openKpiEvaluationModal=async function(id){
    const synced=await syncAutomaticKpiData(id);if(!synced)return;
    const k=(APP.data.kpiMonths||[]).find(x=>x['Mã KPI tháng']===id);if(!k)return;
    const details=kpiDetails(id),temp=kpiTempScore(k),official=Number(k['Tổng điểm KPI']||0);
    const manual=details.filter(d=>d['Nguồn số liệu']==='Nhóm tự nhập');
    const automatic=details.filter(d=>d['Nguồn số liệu']!=='Nhóm tự nhập');
    const renderIndicator=(d,index)=>{
      const isManual=d['Nguồn số liệu']==='Nhóm tự nhập',rule=kpiSourceRuleFrontend(d),na=d['Trạng thái']==='Không áp dụng';
      const selfActual=d['Thực tế tự đánh giá'];
      const approved=d['Thực tế được duyệt']!==''&&d['Thực tế được duyệt']!==undefined?d['Thực tế được duyệt']:selfActual;
      return `<article class="kpi-approval-indicator ${isManual?'manual':'automatic'}"><header><div class="kpi-approval-index">${String(index+1).padStart(2,'0')}</div><div class="kpi-approval-title"><strong>${escapeHtml(d['Tên chỉ tiêu'])}</strong><small>${escapeHtml(d['Nhóm KPI'])} · ${escapeHtml(rule.label||d['Nguồn số liệu'])}</small></div><div class="kpi-approval-state">${statusBadge(na?'Không áp dụng':isManual?'Chờ duyệt':'Tự động')}</div></header><div class="kpi-approval-metrics"><div><small>Mục tiêu</small><b>${kpiActualText(d['Mục tiêu'],d['Đơn vị tính'])}</b></div><div><small>Hệ thống</small><b>${kpiActualText(d['Thực tế hệ thống'],d['Đơn vị tính'])}</b></div><div><small>Nhóm</small><b>${kpiActualText(selfActual,d['Đơn vị tính'])}</b></div><div><small>Trọng số</small><b>${round1(d['Trọng số (%)']||0)}%</b></div></div>${isManual?`<div class="kpi-approval-explain"><span class="material-symbols-rounded">chat_bubble</span><div><b>Giải trình của Nhóm</b><p>${escapeHtml(d['Nhận xét nhân sự']||'Chưa có giải trình.')}</p></div></div><div class="kpi-approval-input-row"><label><span>Thực tế được duyệt</span><input type="number" min="0" step="any" data-kpi-approved-actual data-kpi-detail-id="${escapeAttr(d['Mã chi tiết KPI'])}" value="${escapeAttr(approved??'')}" placeholder="Nhập giá trị"></label><label class="comment"><span>Nhận xét quản lý</span><textarea data-kpi-comment data-kpi-detail-id="${escapeAttr(d['Mã chi tiết KPI'])}" placeholder="Ghi nhận xét nếu cần...">${escapeHtml(d['Nhận xét quản lý']||'')}</textarea></label></div>`:`<div class="kpi-approval-system-note"><span class="material-symbols-rounded">${na?'warning':'verified'}</span>${na?`<div><label class="kpi-na-check"><input type="checkbox" data-kpi-na-confirm data-kpi-detail-id="${escapeAttr(d['Mã chi tiết KPI'])}"><span>Xác nhận không áp dụng trong kỳ này</span></label><small>Chỉ tiêu N/A sẽ được loại khỏi mẫu số khi quản lý xác nhận.</small></div>`:'<div><b>Dữ liệu hệ thống</b><small>Chỉ tiêu này được lấy tự động và sẽ khóa theo dữ liệu hiện tại khi duyệt.</small></div>'}</div>`}</article>`;
    };
    const allCards=[...automatic,...manual].map(renderIndicator).join('');
    const body=`<div class="kpi-approval-shell"><section class="kpi-approval-hero"><div class="kpi-approval-person">${avatarHtml(k['Mã nhân sự'],58)}<div><div class="kpi-approval-name-row"><h2>${escapeHtml(employeeName(k['Mã nhân sự']))}</h2>${statusBadge(k['Trạng thái KPI'])}</div><p>Kỳ ${formatPeriod(k['Kỳ'])} · ${escapeHtml(findEmployee(k['Mã nhân sự'])?.['Nhóm']||'')}</p><div class="kpi-approval-tags"><span>${automatic.length} chỉ tiêu tự động</span><span>${manual.length} chỉ tiêu cần duyệt</span><span>Trần điểm 120%</span></div></div></div><div class="kpi-approval-score-wrap"><div><small>Điểm tạm tính</small><strong>${round1(temp)}<span>/120</span></strong></div><div><small>Điểm đã duyệt</small><strong>${round1(official)}<span>/120</span></strong></div></div></section><section class="kpi-approval-summary"><span class="material-symbols-rounded">forum</span><div><b>Nhận xét tự đánh giá của Nhóm</b><p>${escapeHtml(k['Nhận xét nhân sự']||'Nhóm chưa có nhận xét tổng hợp.')}</p></div></section><div class="kpi-approval-list">${allCards}</div><section class="kpi-approval-manager-note"><label>Nhận xét tổng hợp của quản lý</label><textarea id="kpi-overall-comment" placeholder="Tóm tắt kết quả, điểm mạnh và nội dung cần cải thiện trong kỳ...">${escapeHtml(k['Nhận xét tổng hợp']||'')}</textarea></section><input type="hidden" id="kpi-eval-id" value="${escapeAttr(id)}"></div>`;
    openModal(modalShell('Duyệt đánh giá KPI','Kiểm tra dữ liệu hệ thống, tự đánh giá và giá trị được duyệt trước khi xác nhận kết quả chính thức.',body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-kpi-evaluation"><span class="material-symbols-rounded">verified</span>Duyệt KPI</button>`,'xwide kpi-approval-modal'));
  };


  saveKpiEvaluationModal=async function(){
    const id=document.getElementById('kpi-eval-id')?.value,comment=document.getElementById('kpi-overall-comment')?.value||'',updates=[];
    document.querySelectorAll('[data-kpi-approved-actual]').forEach(el=>{const detailId=el.dataset.kpiDetailId;const c=document.querySelector(`[data-kpi-comment][data-kpi-detail-id="${CSS.escape(detailId)}"]`);updates.push({id:detailId,actual:el.value,comment:c?.value||''});});
    document.querySelectorAll('[data-kpi-na-confirm]').forEach(el=>updates.push({id:el.dataset.kpiDetailId,naConfirmed:Boolean(el.checked)}));
    const t=showToast('Đang duyệt KPI','Hệ thống đang khóa giá trị được duyệt và tính điểm chính thức. Chỉ tiêu N/A chỉ được loại trừ khi quản lý xác nhận.','processing',0);
    try{const res=await gas('evaluateKpi',id,updates,comment,APP.token,{timeout:90000});mergeDataResult(res);closeModal();updateToast(t,'Đã duyệt KPI','Điểm chính thức và xếp loại đã được cập nhật.','success',4000);renderCurrentPage();}catch(err){updateToast(t,'Không thể duyệt KPI',err.message,'error',6000);}
  };

  openKpiProfile=function(id){
    const k=(APP.data.kpiMonths||[]).find(x=>x['Mã KPI tháng']===id);if(!k)return;const details=kpiDetails(id),official=kpiIsOfficial(k),display=kpiDisplayScore(k);
    const body=`<div class="profile-hero">${avatarHtml(k['Mã nhân sự'],58)}<div><h2>${escapeHtml(employeeName(k['Mã nhân sự']))}</h2><p>Kỳ ${formatPeriod(k['Kỳ'])} · ${statusBadge(k['Trạng thái KPI'])}</p></div></div><div class="profile-stats"><div class="profile-stat"><small>${official?'Điểm được duyệt':'Điểm tạm tính'}</small><strong>${round1(display)}/120</strong></div><div class="profile-stat"><small>Xếp loại</small><div style="margin-top:5px">${official?statusBadge(k['Xếp loại']||'Chưa xếp loại'):'<span class="badge badge-gray">Chưa chính thức</span>'}</div></div><div class="profile-stat"><small>Tự đánh giá</small><strong style="font-size:13px">${formatDate(k['Ngày tự đánh giá'])||'-'}</strong></div><div class="profile-stat"><small>Quản lý duyệt</small><strong style="font-size:13px">${formatDate(k['Ngày đánh giá'])||'-'}</strong></div></div><div class="data-table-wrap" style="margin-top:10px"><table class="data-table kpi-profile-table"><thead><tr><th>Chỉ tiêu</th><th>Mục tiêu</th><th>Hệ thống</th><th>Tự đánh giá</th><th>Được duyệt</th><th>Điểm</th><th>Trọng số</th><th>Nguồn</th></tr></thead><tbody>${details.map(d=>`<tr><td class="main-cell"><strong>${escapeHtml(d['Tên chỉ tiêu'])}</strong><small>${escapeHtml(d['Nhóm KPI'])} · ${escapeHtml(d['Chiều đánh giá']||'')}</small></td><td>${kpiActualText(d['Mục tiêu'],d['Đơn vị tính'])}</td><td>${kpiActualText(d['Thực tế hệ thống'],d['Đơn vị tính'])}</td><td>${kpiActualText(d['Thực tế tự đánh giá'],d['Đơn vị tính'])}</td><td>${kpiActualText(d['Thực tế được duyệt'],d['Đơn vị tính'])}</td><td>${round1(d['Điểm chỉ tiêu']||0)}/120</td><td>${round1(d['Trọng số (%)'])}%</td><td>${escapeHtml(kpiSourceRuleFrontend(d).label||d['Nguồn số liệu'])}</td></tr>`).join('')}</tbody></table></div><div class="kpi-comment-grid"><div class="form-section"><strong>Nhận xét Nhóm</strong><p>${escapeHtml(k['Nhận xét nhân sự']||'Chưa có nhận xét.')}</p></div><div class="form-section"><strong>Nhận xét quản lý</strong><p>${escapeHtml(k['Nhận xét tổng hợp']||'Chưa có nhận xét.')}</p></div></div>`;
    const footer=`${canSelfKpi(k)?`<button class="btn" data-action="self-evaluate-kpi" data-id="${id}"><span class="material-symbols-rounded">person_edit</span>Tự đánh giá</button>`:''}${APP.permissions.canEvaluateKpi&&k['Trạng thái KPI']!=='Đã chốt'?`<button class="btn btn-primary" data-action="evaluate-kpi" data-id="${id}"><span class="material-symbols-rounded">fact_check</span>Duyệt KPI</button>`:''}<button class="btn" data-action="close-modal">Đóng</button>`;
    openModal(modalShell('Hồ sơ KPI',`${escapeHtml(k['Mã KPI tháng'])} · Trần điểm cố định 120%`,body,footer,'xwide'));
  };

  openKpiTemplateProfile=function(id){
    const t=(APP.data.kpiTemplates||[]).find(x=>x['Mã mẫu KPI']===id);if(!t)return;const details=(APP.data.kpiTemplateDetails||[]).filter(d=>d['Mã mẫu KPI']===id);
    openModal(modalShell('Chi tiết mẫu KPI',t['Tên mẫu KPI'],`<div class="profile-hero"><div class="entity-icon"><span class="material-symbols-rounded">description</span></div><div><h2>${escapeHtml(t['Tên mẫu KPI'])}</h2><p>${escapeHtml(t['Phạm vi áp dụng'])}: ${escapeHtml(t['Giá trị áp dụng'])} · ${formatDate(t['Ngày hiệu lực'])}</p></div></div><div class="data-table-wrap" style="margin-top:10px"><table class="data-table"><thead><tr><th>Chỉ tiêu</th><th>Nhóm</th><th>Mục tiêu</th><th>Trọng số</th><th>Nguồn đo lường</th><th>Cách ghi nhận</th><th>Chiều đánh giá</th><th>Trần điểm</th></tr></thead><tbody>${details.map(d=>`<tr><td><strong>${escapeHtml(d['Tên chỉ tiêu'])}</strong></td><td>${escapeHtml(d['Nhóm KPI'])}</td><td>${round1(d['Mục tiêu mặc định'])} ${escapeHtml(d['Đơn vị tính'])}</td><td>${round1(d['Trọng số (%)'])}%</td><td>${escapeHtml(kpiSourceRuleFrontend(d).label||d['Chỉ số nguồn'])}</td><td>${escapeHtml(d['Cách ghi nhận'])}</td><td>${escapeHtml(d['Chiều đánh giá'])}</td><td>120%</td></tr>`).join('')}</tbody></table></div>`,`<button class="btn btn-primary" data-action="edit-template" data-id="${id}">Chỉnh sửa</button><button class="btn" data-action="close-modal">Đóng</button>`,'xwide'));
  };

  const KPI_V2_BASE_ROUTE=routeAction;
  routeAction=async function(action,el,e){
    if(action==='self-evaluate-kpi')return window.openKpiSelfEvaluationModal(el.dataset.id||'');
    if(action==='save-kpi-self-evaluation')return window.saveKpiSelfEvaluationModal();
    if(action==='priority-drilldown')return openPriorityDrilldown(el.dataset.priority||'');
    if(action==='feature-clear')return clearFeatureFilters(el.dataset.module||APP.state.page);
    if(action==='feature-filter-option')return setFeatureFilterOption(el.dataset.module||APP.state.page,el.dataset.key||'',decodeURIComponent(el.dataset.value||''));
    if(action==='feature-clear-field')return clearFeatureFilterField(el.dataset.module||APP.state.page,el.dataset.key||'');
    if(action==='gantt-toggle-project')return toggleGanttProject(el.dataset.id||'');
    if(action==='gantt-expand-all')return setAllGanttProjects(true);
    if(action==='gantt-collapse-all')return setAllGanttProjects(false);
    if(action==='preview-bulk-task-reminders')return previewBulkTaskRemindersUi();
    if(action==='send-bulk-task-reminders')return sendBulkTaskRemindersUi();
    if(action==='send-task-reminder')return sendTaskReminderUi(el.dataset.id||'');
    if(action==='save-reminder-settings')return saveReminderSettingsUi();
    return KPI_V2_BASE_ROUTE(action,el,e);
  };
})();


/* ===================== PLANNING + REMINDER MODULES 2026-08 ===================== */
function getFeatureFilterState(module){
  APP.state.featureFilters=APP.state.featureFilters||{};
  APP.state.featureFilters[module]=APP.state.featureFilters[module]||{};
  return APP.state.featureFilters[module];
}
function clearFeatureFilters(module){
  APP.state.featureFilters=APP.state.featureFilters||{};
  APP.state.featureFilters[module]={};
  renderCurrentPage();
}
function setFeatureFilterOption(module,key,value){
  if(!key)return;
  const f=getFeatureFilterState(module);
  f[key]=String(f[key]||'')===String(value||'')?'':String(value||'');
  renderCurrentPage();
}
function clearFeatureFilterField(module,key){
  const f=getFeatureFilterState(module);
  if(key==='dateRange'){
    delete f.from;
    delete f.to;
  }else{
    delete f[key];
  }
  renderCurrentPage();
}
function featureFilterActiveCount(module){
  const f=getFeatureFilterState(module);
  let count=0;
  Object.entries(f).forEach(([key,value])=>{
    if(key==='search'||key==='from'||key==='to')return;
    if(String(value||'').trim())count++;
  });
  if(String(f.from||'').trim()||String(f.to||'').trim())count++;
  return count;
}
function featureCombo(module,key,label,value,options){
  const normalized=(options||[]).map(o=>typeof o==='string'?{value:o,label:o}:o).filter(o=>String(o?.value??'').trim());
  const selected=normalized.find(o=>String(o.value)===String(value));
  return `<div class="inline-filter feature-inline-filter">
    <button class="inline-filter-trigger ${selected?'has-value':''}" type="button" data-action="filter-menu-toggle">
      <span>${escapeHtml(label)}</span>
      ${selected?'<b>1</b>':''}
      <span class="material-symbols-rounded">expand_more</span>
    </button>
    <div class="inline-filter-menu hidden">
      <div class="inline-filter-menu-head"><strong>${escapeHtml(label)}</strong><button type="button" data-action="feature-clear-field" data-module="${escapeAttr(module)}" data-key="${escapeAttr(key)}">Xóa</button></div>
      <div class="inline-filter-options">${normalized.length?normalized.map(o=>`<button type="button" class="inline-filter-option ${String(o.value)===String(value)?'active':''}" data-action="feature-filter-option" data-module="${escapeAttr(module)}" data-key="${escapeAttr(key)}" data-value="${encodeURIComponent(o.value)}"><span class="filter-check"></span><span>${escapeHtml(o.label)}</span></button>`).join(''):'<div class="inline-filter-empty">Chưa có dữ liệu phù hợp</div>'}</div>
    </div>
  </div>`;
}
function featureDateFilter(module,label='Khoảng ngày'){
  const f=getFeatureFilterState(module);
  const active=Boolean(f.from||f.to);
  return `<div class="inline-filter feature-inline-filter">
    <button class="inline-filter-trigger ${active?'has-value':''}" type="button" data-action="filter-menu-toggle">
      <span>${escapeHtml(label)}</span>
      ${active?'<b>1</b>':''}
      <span class="material-symbols-rounded">expand_more</span>
    </button>
    <div class="inline-filter-menu date-filter-menu feature-date-menu hidden">
      <div class="inline-filter-menu-head"><strong>${escapeHtml(label)}</strong><button type="button" data-action="feature-clear-field" data-module="${escapeAttr(module)}" data-key="dateRange">Xóa</button></div>
      <label>Từ ngày</label>
      <input type="date" data-feature-date="${escapeAttr(module)}" data-filter-key="from" value="${escapeAttr(f.from||'')}">
      <label>Đến ngày</label>
      <input type="date" data-feature-date="${escapeAttr(module)}" data-filter-key="to" value="${escapeAttr(f.to||'')}">
      <small>Khoảng ngày được áp dụng ngay sau khi chọn.</small>
    </div>
  </div>`;
}
function featureFilterBar(module,specs,placeholder='Tìm kiếm...'){
  const f=getFeatureFilterState(module);
  const controls=(specs||[]).map(s=>s.type==='date'?featureDateFilter(module,s.label||'Khoảng ngày'):featureCombo(module,s.key,s.label,f[s.key]||'',s.options||[])).join('');
  const active=featureFilterActiveCount(module);
  const hasSearch=Boolean(String(f.search||'').trim());
  return `<section class="panel feature-filter-bar module-toolbar-inline" aria-label="Bộ lọc ${escapeAttr(module)}">
    <div class="feature-filter-top">
      <div class="search-box feature-search"><span class="material-symbols-rounded">search</span><input data-feature-search="${escapeAttr(module)}" value="${escapeAttr(f.search||'')}" placeholder="${escapeAttr(placeholder)}"></div>
      ${(active||hasSearch)?`<button class="clear-inline-filters feature-clear-btn" type="button" data-action="feature-clear" data-module="${escapeAttr(module)}"><span class="material-symbols-rounded">filter_alt_off</span>Xóa lọc</button>`:''}
    </div>
    <div class="inline-filter-row feature-filter-grid">
      <div class="inline-filter-label"><span class="material-symbols-rounded">filter_alt</span>Bộ lọc</div>
      ${controls}
    </div>
  </section>`;
}
function featureDateRange(module){
  return featureDateFilter(module,'Khoảng ngày');
}
function taskDueState(t){if(isTaskOverdue(t))return 'Quá hạn';const due=parseDate(t['Hạn hoàn thành']);if(!due)return 'Không có hạn';const today=new Date();today.setHours(0,0,0,0);due.setHours(0,0,0,0);const days=Math.round((due-today)/86400000);return days>=0&&days<=2?'Sắp đến hạn':'Bình thường';}
function applyFeatureTaskFilters(module,rows){
  const f=getFeatureFilterState(module),q=normalizeText(f.search||'');
  return (rows||[]).filter(t=>{
    if(q&&!normalizeText([t['Mã công việc'],t['Tên công việc'],projectName(t['Mã dự án']),employeeName(t['Mã người phụ trách']),t['Nhóm công việc']].join(' ')).includes(q))return false;
    if(f.project&&String(t['Mã dự án'])!==String(f.project))return false;
    if(f.assignee&&String(t['Mã người phụ trách'])!==String(f.assignee))return false;
    if(f.priority&&String(t['Mức độ ưu tiên'])!==String(f.priority))return false;
    if(f.status&&String(t['Trạng thái'])!==String(f.status))return false;
    if(f.due&&taskDueState(t)!==f.due)return false;
    return true;
  });
}
function taskToneClass(t){if(isTaskOverdue(t))return 'overdue';if(t['Trạng thái']==='Hoàn thành')return 'done';if(t['Trạng thái']==='Chờ xác nhận')return 'waiting';if(t['Mức độ ưu tiên']==='Khẩn')return 'urgent';return 'active';}

function renderKanban(){
  const base=(APP.data.tasks||[]).filter(t=>!['Đã hủy'].includes(t['Trạng thái']));
  const rows=applyFeatureTaskFilters('kanban',base);
  const statuses=['Chưa bắt đầu','Đang thực hiện','Chờ xác nhận','Hoàn thành'];
  const filters=featureFilterBar('kanban',[
    {key:'project',label:'Dự án',options:[{value:'',label:'Tất cả dự án'},...projectOptions()]},
    {key:'assignee',label:'Người phụ trách',options:[{value:'',label:'Tất cả nhân sự'},...personOptions()]},
    {key:'priority',label:'Ưu tiên',options:[{value:'',label:'Tất cả ưu tiên'},...(APP.data.fixedOptions?.priority||[]).map(v=>({value:v,label:v}))]},
    {key:'due',label:'Tình trạng hạn',options:[{value:'',label:'Tất cả thời hạn'},{value:'Quá hạn',label:'Quá hạn'},{value:'Sắp đến hạn',label:'Sắp đến hạn'},{value:'Bình thường',label:'Bình thường'}]}
  ],'Tìm công việc, dự án hoặc người phụ trách...');
  const board=statuses.map((status,i)=>{const items=rows.filter(t=>t['Trạng thái']===status);return `<section class="kanban-column tone-${i+1}"><header><div><span class="kanban-dot"></span><strong>${escapeHtml(status)}</strong></div><b>${items.length}</b></header><div class="kanban-list">${items.length?items.map(t=>`<article class="kanban-card ${taskToneClass(t)}"><div class="kanban-card-top"><span class="kanban-project">${escapeHtml(projectName(t['Mã dự án'])||'Không có dự án')}</span>${statusBadge(t['Mức độ ưu tiên'])}</div><h3>${escapeHtml(t['Tên công việc'])}</h3><p>${escapeHtml(t['Mã công việc'])} · ${escapeHtml(t['Nhóm công việc']||'')}</p><div class="kanban-progress"><div class="progress"><span style="width:${clamp(Number(t['Tiến độ (%)']||0),0,100)}%"></span></div><small>${round1(t['Tiến độ (%)']||0)}%</small></div><div class="kanban-card-footer"><div>${avatarHtml(t['Mã người phụ trách'],28)}<span>${escapeHtml(employeeName(t['Mã người phụ trách']))}</span></div><div class="kanban-actions"><span class="kanban-due ${isTaskOverdue(t)?'overdue':''}">${formatDate(t['Hạn hoàn thành'])||'-'}</span><button class="row-action view" data-action="view-task" data-id="${escapeAttr(t['Mã công việc'])}"><span class="material-symbols-rounded">visibility</span></button>${APP.permissions.canSendReminders&&!['Hoàn thành','Đã hủy'].includes(t['Trạng thái'])?`<button class="row-action reminder" data-action="send-task-reminder" data-id="${escapeAttr(t['Mã công việc'])}" title="Gửi nhắc việc"><span class="material-symbols-rounded">notifications_active</span></button>`:''}</div></div></article>`).join(''):`<div class="kanban-empty">Không có công việc</div>`}</div></section>`}).join('');
  document.getElementById('page-content').innerHTML=`<div class="page-shell kanban-page">${pageHead('Kanban','Theo dõi công việc theo trạng thái, tiến độ và hạn xử lý trên một bảng trực quan.')}${filters}<div class="kanban-summary"><article class="kanban-stat-card total"><span class="kanban-stat-icon material-symbols-rounded">view_kanban</span><div><strong>${rows.length}</strong><small>Công việc</small></div></article><article class="kanban-stat-card overdue"><span class="kanban-stat-icon material-symbols-rounded">schedule</span><div><strong>${rows.filter(isTaskOverdue).length}</strong><small>Quá hạn</small></div></article><article class="kanban-stat-card waiting"><span class="kanban-stat-icon material-symbols-rounded">hourglass_top</span><div><strong>${rows.filter(t=>t['Trạng thái']==='Chờ xác nhận').length}</strong><small>Chờ xác nhận</small></div></article></div><div class="kanban-board">${board}</div></div>`;
}

function getGanttExpanded(){
  if(!(APP.state.ganttExpanded instanceof Set))APP.state.ganttExpanded=new Set((APP.data.projects||[]).map(p=>String(p['Mã dự án'])));
  return APP.state.ganttExpanded;
}
function toggleGanttProject(id){const s=getGanttExpanded();s.has(id)?s.delete(id):s.add(id);renderCurrentPage();}
function setAllGanttProjects(expand){const s=getGanttExpanded();s.clear();if(expand)(APP.data.projects||[]).forEach(p=>s.add(String(p['Mã dự án'])));renderCurrentPage();}
function ganttDate(v){const d=parseDate(v);return d&&!isNaN(d)?d:null;}
function ganttOverlap(start,end,from,to){if(!from&&!to)return true;start=ganttDate(start);end=ganttDate(end)||start;if(!start&&!end)return true;const a=start||end,b=end||start;const f=from?parseDate(from):null,t=to?parseDate(to):null;return (!f||b>=f)&&(!t||a<=new Date(t.getFullYear(),t.getMonth(),t.getDate(),23,59,59));}
function ganttBarStyle(start,end,min,max){start=ganttDate(start)||min;end=ganttDate(end)||start;const total=Math.max(1,max-min),left=clamp((start-min)*100/total,0,100),right=clamp((end-min)*100/total,0,100),width=Math.max(1.2,right-left);return `left:${left}%;width:${Math.min(width,100-left)}%`;}
function renderGantt(){
  const f=getFeatureFilterState('gantt'),q=normalizeText(f.search||'');
  const tasks=APP.data.tasks||[];
  const projects=(APP.data.projects||[]).filter(p=>{
    const child=tasks.filter(t=>t['Mã dự án']===p['Mã dự án']);
    if(q&&!normalizeText([p['Mã dự án'],p['Tên dự án'],employeeName(p['Mã người phụ trách']),...child.map(t=>t['Tên công việc'])].join(' ')).includes(q))return false;
    if(f.owner&&String(p['Mã người phụ trách'])!==String(f.owner))return false;
    if(f.status&&String(p['Trạng thái'])!==String(f.status))return false;
    if(f.type&&String(p['Loại dự án'])!==String(f.type))return false;
    return ganttOverlap(p['Ngày bắt đầu'],p['Ngày dự kiến kết thúc'],f.from,f.to);
  });
  let dates=[];projects.forEach(p=>{dates.push(ganttDate(p['Ngày bắt đầu']),ganttDate(p['Ngày dự kiến kết thúc']));tasks.filter(t=>t['Mã dự án']===p['Mã dự án']).forEach(t=>dates.push(ganttDate(t['Ngày bắt đầu']),ganttDate(t['Hạn hoàn thành'])));});dates=dates.filter(Boolean);
  let min=dates.length?new Date(Math.min(...dates)):startOfMonth(new Date()),max=dates.length?new Date(Math.max(...dates)):endOfMonth(new Date());if(max<=min)max=new Date(min.getTime()+86400000);min=new Date(min.getFullYear(),min.getMonth(),min.getDate());max=new Date(max.getFullYear(),max.getMonth(),max.getDate()+1);
  const ticks=Array.from({length:8},(_,i)=>new Date(min.getTime()+(max-min)*i/7));
  const expanded=getGanttExpanded();
  const rows=projects.map(p=>{const id=String(p['Mã dự án']),children=tasks.filter(t=>t['Mã dự án']===id&&t['Trạng thái']!=='Đã hủy').sort((a,b)=>(ganttDate(a['Ngày bắt đầu'])||0)-(ganttDate(b['Ngày bắt đầu'])||0));return `<div class="gantt-row project"><div class="gantt-label"><button class="gantt-toggle" data-action="gantt-toggle-project" data-id="${escapeAttr(id)}"><span class="material-symbols-rounded">${expanded.has(id)?'expand_more':'chevron_right'}</span></button><div class="gantt-label-copy"><strong>${escapeHtml(p['Tên dự án'])}</strong><small>${escapeHtml(id)} · ${escapeHtml(employeeName(p['Mã người phụ trách']))}</small></div>${statusBadge(p['Trạng thái'])}</div><div class="gantt-track">${ticks.map((_,i)=>`<i style="left:${i*100/7}%"></i>`).join('')}<button class="gantt-bar project-bar" style="${ganttBarStyle(p['Ngày bắt đầu'],p['Ngày dự kiến kết thúc'],min,max)}" data-action="view-project" data-id="${escapeAttr(id)}"><span>${round1(p['Tiến độ (%)']||0)}%</span></button></div></div>${expanded.has(id)?children.map(t=>`<div class="gantt-row task"><div class="gantt-label"><span class="gantt-child-line"></span><div class="gantt-label-copy"><strong>${escapeHtml(t['Tên công việc'])}</strong><small>${escapeHtml(t['Mã công việc'])} · ${escapeHtml(employeeName(t['Mã người phụ trách']))}</small></div></div><div class="gantt-track">${ticks.map((_,i)=>`<i style="left:${i*100/7}%"></i>`).join('')}<button class="gantt-bar task-bar ${taskToneClass(t)}" style="${ganttBarStyle(t['Ngày bắt đầu'],t['Hạn hoàn thành'],min,max)}" data-action="view-task" data-id="${escapeAttr(t['Mã công việc'])}"><span>${round1(t['Tiến độ (%)']||0)}%</span></button></div></div>`).join(''):''}`;}).join('');
  const filters=featureFilterBar('gantt',[
    {key:'owner',label:'Người phụ trách',options:[{value:'',label:'Tất cả nhân sự'},...personOptions()]},
    {key:'status',label:'Trạng thái dự án',options:[{value:'',label:'Tất cả trạng thái'},...(APP.data.fixedOptions?.projectStatus||[]).map(v=>({value:v,label:v}))]},
    {key:'type',label:'Loại dự án',options:[{value:'',label:'Tất cả loại dự án'},...(APP.data.categories?.['Loại dự án']||[]).map(v=>({value:v,label:v}))]},
    {key:'dateRange',label:'Khoảng ngày',type:'date'}
  ],'Tìm dự án hoặc công việc...');
  document.getElementById('page-content').innerHTML=`<div class="page-shell gantt-page">${pageHead('Gantt','Theo dõi thời gian dự án và công việc; mở rộng từng dự án để xem chi tiết.',`<button class="btn" data-action="gantt-collapse-all"><span class="material-symbols-rounded">unfold_less</span>Thu gọn</button><button class="btn btn-primary" data-action="gantt-expand-all"><span class="material-symbols-rounded">unfold_more</span>Mở rộng</button>`)}${filters}<section class="panel gantt-shell">${projects.length?`<div class="gantt-scroll"><div class="gantt-grid"><div class="gantt-row gantt-head"><div class="gantt-label"><strong>Dự án / công việc</strong></div><div class="gantt-timeline-head">${ticks.map((d,i)=>`<span style="left:${i*100/7}%">${formatDate(d)}</span>`).join('')}</div></div>${rows}</div></div>`:emptyState('waterfall_chart','Không có dự án phù hợp','Thử thay đổi bộ lọc hoặc khoảng ngày.')}</section></div>`;
}

function reminderCandidateRows(){return (APP.data.tasks||[]).filter(t=>!['Hoàn thành','Đã hủy'].includes(t['Trạng thái'])&&['Quá hạn','Sắp đến hạn'].includes(taskDueState(t)));}
function renderReminders(){
  const settings=APP.data.reminderSettings||{masterEnabled:false,enabled:false,hours:[8,12,17],availableHours:[8,12,17],isAdmin:Boolean(APP.permissions.isAdmin)};
  let rows=applyFeatureTaskFilters('reminders',reminderCandidateRows());
  rows=rows.sort((a,b)=>{const ao=isTaskOverdue(a)?0:1,bo=isTaskOverdue(b)?0:1;return ao-bo||(parseDate(a['Hạn hoàn thành'])||0)-(parseDate(b['Hạn hoàn thành'])||0);});
  const filters=featureFilterBar('reminders',[
    {key:'project',label:'Dự án',options:[{value:'',label:'Tất cả dự án'},...projectOptions()]},
    {key:'assignee',label:'Người nhận',options:[{value:'',label:'Tất cả nhân sự'},...personOptions()]},
    {key:'due',label:'Tình trạng hạn',options:[{value:'',label:'Tất cả'},{value:'Quá hạn',label:'Quá hạn'},{value:'Sắp đến hạn',label:'Sắp đến hạn'}]}
  ],'Tìm công việc cần nhắc...');
  const timeOptions=(settings.availableHours||[8,12,17]).map(h=>`<label class="reminder-time-option"><input type="checkbox" data-reminder-hour value="${h}" ${(settings.hours||[]).includes(h)?'checked':''}><span>${String(h).padStart(2,'0')}:00</span></label>`).join('');
  document.getElementById('page-content').innerHTML=`<div class="page-shell reminder-page">${pageHead('Nhắc việc','Gửi nhắc thủ công hoặc cấu hình gửi tự động cho công việc sắp đến hạn và quá hạn.')}<div class="reminder-summary-grid"><div class="panel reminder-summary red"><span class="material-symbols-rounded">warning</span><div><small>Quá hạn</small><strong>${rows.filter(isTaskOverdue).length}</strong></div></div><div class="panel reminder-summary orange"><span class="material-symbols-rounded">schedule</span><div><small>Sắp đến hạn</small><strong>${rows.filter(t=>taskDueState(t)==='Sắp đến hạn').length}</strong></div></div><div class="panel reminder-summary blue"><span class="material-symbols-rounded">mail</span><div><small>Có thể gửi</small><strong>${rows.filter(t=>Boolean(findEmployee(t['Mã người phụ trách'])?.['Email'])).length}</strong></div></div></div><section class="panel reminder-settings"><div class="reminder-settings-copy"><div class="reminder-settings-icon"><span class="material-symbols-rounded">notifications_active</span></div><div><h2>Gửi tự động</h2><p>Chọn các khung giờ cố định. Hệ thống chỉ gửi khi có công việc quá hạn hoặc còn tối đa 2 ngày đến hạn.</p></div></div><div class="reminder-settings-controls"><label class="switch-line"><span><b>Nhắc tự động cho tài khoản này</b><small>Lưu theo tài khoản đang đăng nhập</small></span><input id="reminder-user-enabled" type="checkbox" ${settings.enabled?'checked':''}><i></i></label><div class="reminder-time-list">${timeOptions}</div>${settings.isAdmin?`<label class="switch-line master"><span><b>Bật tất</b><small>Bật nhắc tự động cho tất cả tài khoản đang hoạt động. Giữ giờ riêng đã lưu; tài khoản chưa cấu hình dùng 08:00, 12:00 và 17:00.</small></span><input id="reminder-master-enabled" type="checkbox" ${settings.masterEnabled?'checked':''}><i></i></label>`:`<div class="reminder-master-info ${settings.masterEnabled?'on':'off'}"><span class="material-symbols-rounded">${settings.masterEnabled?'check_circle':'pause_circle'}</span>${settings.masterEnabled?'Tự động toàn hệ thống đang bật':'Tự động toàn hệ thống đang tắt'}</div>`}<button class="btn btn-primary" data-action="save-reminder-settings"><span class="material-symbols-rounded">save</span>Lưu cài đặt</button></div></section>${filters}<section class="panel table-panel reminder-table-panel">${rows.length?`<div class="data-table-wrap"><table class="data-table reminder-table"><thead><tr><th>Công việc</th><th>Dự án</th><th>Người nhận</th><th>Hạn hoàn thành</th><th>Tình trạng</th><th>Ưu tiên</th><th style="width:112px">Gửi</th></tr></thead><tbody>${rows.map(t=>`<tr><td class="main-cell"><strong>${escapeHtml(t['Tên công việc'])}</strong><small>${escapeHtml(t['Mã công việc'])}</small></td><td>${escapeHtml(projectName(t['Mã dự án']))}</td><td>${personInline(t['Mã người phụ trách'])}<small class="reminder-email">${escapeHtml(findEmployee(t['Mã người phụ trách'])?.['Email']||'Chưa có email')}</small></td><td class="${isTaskOverdue(t)?'text-danger':''}"><strong>${formatDate(t['Hạn hoàn thành'])}</strong></td><td>${statusBadge(taskDueState(t))}</td><td>${statusBadge(t['Mức độ ưu tiên'])}</td><td><button class="btn btn-sm ${findEmployee(t['Mã người phụ trách'])?.['Email']?'btn-primary':''}" data-action="send-task-reminder" data-id="${escapeAttr(t['Mã công việc'])}" ${findEmployee(t['Mã người phụ trách'])?.['Email']?'':'disabled'}><span class="material-symbols-rounded">send</span>Gửi</button></td></tr>`).join('')}</tbody></table></div>`:emptyState('notifications_none','Không có công việc cần nhắc','Công việc quá hạn hoặc còn tối đa 2 ngày đến hạn sẽ hiển thị tại đây.')}</section></div>`;
}
async function previewBulkTaskRemindersUi(){
  const toast=showToast('Đang thống kê công việc','Đang kiểm tra các công việc chưa hoàn thành và thành viên cần được nhắc.','processing',0);
  try{
    const preview=await gas('previewBulkTaskReminders',APP.token,{timeout:90000});
    updateToast(toast,'Đã thống kê',preview.message||'Đã hoàn tất thống kê.','success',2200);
    if(!preview.totalTasks||!preview.totalRecipients){
      showToast('Không có công việc cần nhắc','Không tìm thấy công việc còn thiếu tiến độ hoặc không có người nhận email hợp lệ.','info',5000);
      return;
    }
    const body=`<div class="bulk-reminder-summary">
      <div class="bulk-reminder-stat"><strong>${Number(preview.totalTasks||0)}</strong><span>Công việc chưa hoàn thành</span></div>
      <div class="bulk-reminder-stat"><strong>${Number(preview.totalRecipients||0)}</strong><span>Thành viên nhận email</span></div>
    </div>
    <div class="form-section">
      <div class="form-section-title"><span class="material-symbols-rounded">info</span>Phạm vi gửi nhắc</div>
      <ul class="bulk-reminder-notes">
        <li>Chỉ lấy công việc trong phạm vi dữ liệu mà tài khoản của bạn được phép quản lý.</li>
        <li>Chỉ nhắc công việc chưa hoàn thành và có tiến độ dưới 100%.</li>
        <li>Email được gửi cho người phụ trách và thành viên đang tham gia công việc.</li>
        <li>Mỗi thành viên chỉ nhận một email tổng hợp, kể cả khi họ tham gia nhiều công việc.</li>
        <li>Công việc đã hoàn thành, đã hủy hoặc thành viên không có email hợp lệ sẽ không được gửi.</li>
      </ul>
      ${(Number(preview.missingEmailCount||0)>0||Number(preview.noRecipientTaskCount||0)>0)?`<div class="bulk-reminder-warning"><span class="material-symbols-rounded">warning</span><span>${Number(preview.missingEmailCount||0)} hồ sơ thành viên thiếu email hợp lệ; ${Number(preview.noRecipientTaskCount||0)} công việc không có người nhận hợp lệ.</span></div>`:''}
    </div>`;
    openModal(modalShell('Xác nhận nhắc việc tất cả','Kiểm tra số lượng trước khi gửi email hàng loạt.',body,
      `<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="send-bulk-task-reminders"><span class="material-symbols-rounded">send</span>Gửi nhắc ${Number(preview.totalRecipients||0)} thành viên</button>`,'small'));
  }catch(err){
    updateToast(toast,'Không thể thống kê',err.message||'Đã xảy ra lỗi.','error',6000);
  }
}
async function sendBulkTaskRemindersUi(){
  const button=document.querySelector('[data-action="send-bulk-task-reminders"]');
  if(button){button.disabled=true;button.innerHTML='<span class="material-symbols-rounded">progress_activity</span>Đang gửi...';}
  const toast=showToast('Đang gửi nhắc việc','Hệ thống đang gửi email tổng hợp cho các thành viên có công việc chưa hoàn thành.','processing',0);
  try{
    const result=await gas('sendBulkTaskReminders',APP.token,{timeout:120000});
    closeModal();
    updateToast(toast,result.sentCount?'Đã gửi nhắc việc':'Không có email được gửi',result.message||'Đã xử lý xong đợt nhắc việc. ',result.failedCount?'warning':'success',7000);
  }catch(err){
    if(button){button.disabled=false;button.innerHTML='<span class="material-symbols-rounded">send</span>Thử gửi lại';}
    updateToast(toast,'Không thể gửi nhắc việc',err.message||'Đã xảy ra lỗi.','error',7000);
  }
}

async function sendTaskReminderUi(id){
  const t=showToast('Đang gửi nhắc việc','Email đang được gửi tới người phụ trách công việc.','processing',0);
  try{const res=await gas('sendTaskReminder',id,APP.token,{timeout:60000});updateToast(t,'Đã gửi nhắc việc',res.message||'Email nhắc việc đã được gửi.','success',3800);}catch(err){updateToast(t,'Không thể gửi nhắc việc',err.message,'error',6000);}
}
async function saveReminderSettingsUi(){
  const hours=[...document.querySelectorAll('[data-reminder-hour]:checked')].map(x=>Number(x.value));
  if(!hours.length){showToast('Chưa chọn khung giờ','Chọn ít nhất một khung giờ 08:00, 12:00 hoặc 17:00.','warning',4500);return;}
  const payload={enabled:Boolean(document.getElementById('reminder-user-enabled')?.checked),hours};
  const master=document.getElementById('reminder-master-enabled');if(master)payload.masterEnabled=Boolean(master.checked);
  const t=showToast('Đang lưu cài đặt','Đang cập nhật lịch gửi nhắc việc.','processing',0);
  try{const res=await gas('saveReminderSettings',payload,APP.token,{timeout:60000});APP.data.reminderSettings=res.reminderSettings||APP.data.reminderSettings;updateToast(t,'Đã lưu cài đặt','Cấu hình nhắc việc đã được cập nhật.','success',3500);renderCurrentPage();}catch(err){updateToast(t,'Không thể lưu cài đặt',err.message,'error',6000);}
}

/* ========================= A4 REPORT EXPORT ========================= */
const A4_REPORT_THEME={
  primary:'#4F46E5',primary2:'#6366F1',blue:'#2F80ED',green:'#21B47E',orange:'#F59E0B',red:'#EF476F',violet:'#7C5CE7',cyan:'#20A8D8',navy:'#152447',muted:'#6B7890',line:'#DEE5F1',soft:'#F7F9FD'
};

function syncDashboardPdfButton(page=APP.state.page){
  const btn=document.getElementById('dashboard-export-pdf');
  if(!btn)return;
  const allowed=Boolean(APP.permissions.isAdmin||APP.permissions.isManager);
  btn.classList.toggle('hidden',!(allowed&&page==='dashboard'));
}

function a4ReportPeriodLabel(period=APP.state.period){
  const from=period?.from?parseDate(period.from):null,to=period?.to?parseDate(period.to):null;
  if(period?.key==='this-month'||period?.key==='last-month') return from?`Tháng ${String(from.getMonth()+1).padStart(2,'0')}/${from.getFullYear()}`:(period?.label||'');
  if(period?.key==='this-quarter'||period?.key==='last-quarter') return from?`Quý ${Math.floor(from.getMonth()/3)+1}/${from.getFullYear()}`:(period?.label||'');
  if(period?.key==='this-year') return from?`Năm ${from.getFullYear()}`:(period?.label||'');
  if(period?.key==='custom'&&from&&to) return `${formatDate(from)} – ${formatDate(to)}`;
  return period?.label||'Kỳ đang xem';
}

function a4ReportPreviousRange(period=APP.state.period){
  const from=period?.from?startOfDay(period.from):null,to=period?.to?endOfDay(period.to):null;
  if(!from||!to)return null;
  if(['this-month','last-month'].includes(period.key)){
    const prev=new Date(from.getFullYear(),from.getMonth()-1,1);return {from:startOfMonth(prev),to:endOfMonth(prev)};
  }
  if(['this-quarter','last-quarter'].includes(period.key)){
    const prev=new Date(from.getFullYear(),from.getMonth()-3,1);return {from:startOfQuarter(prev),to:endOfQuarter(prev)};
  }
  if(period.key==='this-year')return {from:new Date(from.getFullYear()-1,0,1),to:new Date(from.getFullYear()-1,11,31,23,59,59)};
  const span=Math.max(86400000,to.getTime()-from.getTime()+1);return {from:new Date(from.getTime()-span),to:new Date(from.getTime()-1)};
}

function a4ReportFilterRange(rows,dateField,range){
  if(!range)return [];
  return (rows||[]).filter(r=>{
    if(dateField==='Hạn hoàn thành' && r && ('Ngày bắt đầu' in r || 'Hạn hoàn thành' in r)){
      return taskRangeOverlapsPeriod(r,range.from,range.to);
    }
    const d=parseDate(r?.[dateField]);
    return d&&d>=range.from&&d<=range.to;
  });
}

function a4ReportAverageKpi(rows){return rows.length?round1(rows.reduce((s,k)=>s+Number(k['Tổng điểm KPI']||0),0)/rows.length):0;}
function a4ReportPct(part,total){return total?round1(Number(part||0)*100/total):0;}
function a4ReportDelta(current,previous,suffix=''){
  const diff=round1(Number(current||0)-Number(previous||0));
  if(Math.abs(diff)<0.05)return {text:'Không đổi so với kỳ trước',tone:'neutral'};
  return {text:`${diff>0?'↑':'↓'} ${Math.abs(diff)}${suffix} so với kỳ trước`,tone:diff>0?'up':'down'};
}
function a4ReportCountDelta(current,previous){
  const diff=Number(current||0)-Number(previous||0);if(!diff)return {text:'Không đổi so với kỳ trước',tone:'neutral'};
  return {text:`${diff>0?'↑':'↓'} ${Math.abs(diff)} so với kỳ trước`,tone:diff>0?'up':'down'};
}

function a4ReportBuildDepartmentTaskData(tasks){
  const map={};
  (tasks||[]).forEach(t=>{
    const dep=findEmployee(t['Mã người phụ trách'])?.['Nhóm']||'Khác';
    if(!map[dep])map[dep]={total:0,done:0};
    map[dep].total++;if(t['Trạng thái']==='Hoàn thành')map[dep].done++;
  });
  return Object.entries(map).sort((a,b)=>b[1].total-a[1].total).slice(0,7).map(([label,v])=>({label,total:v.total,done:v.done}));
}
function a4ReportBuildDepartmentKpiData(kpis){
  const map={};
  (kpis||[]).forEach(k=>{
    const dep=findEmployee(k['Mã nhân sự'])?.['Nhóm']||'Khác';
    if(!map[dep])map[dep]={sum:0,n:0};map[dep].sum+=Number(k['Tổng điểm KPI']||0);map[dep].n++;
  });
  return Object.entries(map).map(([label,v])=>({label,value:round1(v.sum/v.n)})).sort((a,b)=>b.value-a.value).slice(0,8);
}

function buildA4ReportData(){
  const period=APP.state.period||{};
  const dashboardTab=APP.state.dashboardTab||'overview';
  const filterState=dashboardFilterState(dashboardTab);
  const tasks=dashboardApplyTaskFilters(periodFilter(APP.data.tasks||[],'Hạn hoàn thành'),filterState);
  const projects=dashboardApplyProjectFilters(APP.data.projects||[],filterState);
  const officialKpis=dashboardApplyKpiFilters(periodFilter(APP.data.kpiMonths||[],'Kỳ').filter(k=>['Đã đánh giá','Đã chốt'].includes(k['Trạng thái KPI'])),filterState);
  const previous=a4ReportPreviousRange(period);
  const prevTasks=dashboardApplyTaskFilters(a4ReportFilterRange(APP.data.tasks||[],'Hạn hoàn thành',previous),filterState);
  const prevKpis=dashboardApplyKpiFilters(a4ReportFilterRange(APP.data.kpiMonths||[],'Kỳ',previous).filter(k=>['Đã đánh giá','Đã chốt'].includes(k['Trạng thái KPI'])),filterState);

  const done=tasks.filter(t=>t['Trạng thái']==='Hoàn thành');
  const overdue=tasks.filter(isTaskOverdue);
  const waiting=tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận');
  const completion=a4ReportPct(done.length,tasks.length);
  const avgKpi=a4ReportAverageKpi(officialKpis);
  const exceed=new Set(officialKpis.filter(k=>Number(k['Tổng điểm KPI']||0)>100).map(k=>String(k['Mã nhân sự']||''))).size;
  const activeProjects=projects.filter(p=>p['Trạng thái']==='Đang thực hiện').length;
  const prevDone=prevTasks.filter(t=>t['Trạng thái']==='Hoàn thành');
  const prevCompletion=a4ReportPct(prevDone.length,prevTasks.length);
  const prevAvgKpi=a4ReportAverageKpi(prevKpis);
  const prevExceed=new Set(prevKpis.filter(k=>Number(k['Tổng điểm KPI']||0)>100).map(k=>String(k['Mã nhân sự']||''))).size;

  const end=period.to?parseDate(period.to):new Date();
  const trendMonths=Array.from({length:6},(_,i)=>new Date(end.getFullYear(),end.getMonth()-(5-i),1));
  const trend=trendMonths.map(m=>{
    const rows=dashboardApplyKpiFilters((APP.data.kpiMonths||[]).filter(k=>sameMonth(parseDate(k['Kỳ']),m)&&['Đã đánh giá','Đã chốt'].includes(k['Trạng thái KPI'])),filterState);
    return rows.length?a4ReportAverageKpi(rows):0;
  });
  const statusOrder=['Đang thực hiện','Chờ xác nhận','Chưa bắt đầu','Hoàn thành','Đã hủy'];
  const statusCount=countBy(tasks,'Trạng thái');
  const statusLabels=statusOrder.filter(x=>statusCount[x]).concat(Object.keys(statusCount).filter(x=>!statusOrder.includes(x)&&statusCount[x]));
  const priorities=['Cao','Thấp','Khẩn','Bình thường'];
  const priorityCount=countBy(tasks,'Mức độ ưu tiên');
  const groupCount=countBy(tasks,'Nhóm công việc');
  const departmentTasks=a4ReportBuildDepartmentTaskData(tasks);
  const departmentKpi=a4ReportBuildDepartmentKpiData(officialKpis);
  const kpiClass=countBy(officialKpis,'Xếp loại');

  const metrics=[
    {label:'Tổng công việc',value:tasks.length,icon:'checklist',tone:'blue',note:a4ReportCountDelta(tasks.length,prevTasks.length)},
    {label:'Tỷ lệ hoàn thành',value:`${completion}%`,icon:'check',tone:'green',note:a4ReportDelta(completion,prevCompletion,'%')},
    {label:'Quá hạn',value:overdue.length,icon:'clock',tone:'red',note:{text:overdue.length?'Cần ưu tiên xử lý':'Không có việc quá hạn',tone:overdue.length?'down':'up'}},
    {label:'Dự án đang chạy',value:activeProjects,icon:'folder',tone:'blue',note:{text:'Theo trạng thái hiện tại',tone:'neutral'}},
    {label:'KPI trung bình',value:`${avgKpi}%`,icon:'trend',tone:'violet',note:a4ReportDelta(avgKpi,prevAvgKpi,' điểm')},
    {label:'Nhân sự vượt KPI',value:exceed,icon:'people',tone:'green',note:a4ReportCountDelta(exceed,prevExceed)}
  ];

  const highestDepartment=departmentTasks[0]?.label||'Chưa đủ dữ liệu';
  const lowCompletionDepartment=[...departmentTasks].filter(x=>x.total).sort((a,b)=>(a.done/a.total)-(b.done/b.total))[0]?.label||'Chưa đủ dữ liệu';
  const highRisk=tasks.filter(t=>['Cao','Khẩn'].includes(t['Mức độ ưu tiên'])&&t['Trạng thái']!=='Hoàn thành').length;
  const insights=[
    ['Hiệu suất tổng thể',`KPI trung bình đạt ${avgKpi}%; tỷ lệ hoàn thành công việc đạt ${completion}% trong kỳ.`],
    ['Tiến độ công việc',`${done.length}/${tasks.length} công việc đã hoàn thành; ${overdue.length} công việc quá hạn và ${waiting.length} công việc đang chờ xác nhận.`],
    ['Theo Nhóm',`${highestDepartment} có khối lượng công việc cao nhất; ${lowCompletionDepartment} cần được theo dõi sát về tỷ lệ hoàn thành.`],
    ['Ưu tiên & rủi ro',`${highRisk} công việc ưu tiên Cao/Khẩn chưa hoàn thành cần được theo dõi sát để bảo đảm tiến độ.`],
    ['Nhân sự & KPI',`${exceed} nhân sự vượt 100 điểm KPI; KPI trung bình chính thức hiện là ${avgKpi}%.`],
    ['Khuyến nghị',overdue.length?`Ưu tiên xử lý ${overdue.length} công việc quá hạn, sau đó giải quyết các hồ sơ đang chờ xác nhận.`:'Duy trì nhịp hoàn thành hiện tại và tập trung nâng hiệu suất tại các Nhóm có tỷ lệ hoàn thành thấp.']
  ];

  return {
    periodLabel:a4ReportPeriodLabel(period),exportedAt:new Date(),exporter:APP.session?.employeeName||APP.session?.username||'Người dùng',
    tasks,projects,officialKpis,metrics,insights,completion,avgKpi,activeProjects,exceed,done,overdue,waiting,
    trend:{labels:trendMonths.map(formatPeriod),values:trend},
    taskStatus:{labels:statusLabels,values:statusLabels.map(x=>statusCount[x]||0)},
    priorities:priorities.map(label=>({label,value:priorityCount[label]||0,pct:a4ReportPct(priorityCount[label]||0,tasks.length)})),
    departmentTasks,
    taskGroups:Object.entries(groupCount).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value).slice(0,8),
    kpiPeople:Object.entries(officialKpis.reduce((acc,k)=>{const id=String(k['Mã nhân sự']||'');if(!acc[id])acc[id]={sum:0,n:0};acc[id].sum+=Number(k['Tổng điểm KPI']||0);acc[id].n++;return acc;},{})).map(([id,v])=>({label:employeeName(id),value:round1(v.sum/v.n)})).sort((a,b)=>b.value-a.value).slice(0,10),
    kpiClass:{labels:Object.keys(kpiClass),values:Object.values(kpiClass)},departmentKpi,
    taskMetrics:[
      {label:'Tổng công việc',value:tasks.length,tone:'blue'},{label:'Hoàn thành',value:done.length,tone:'green'},
      {label:'Tỷ lệ hoàn thành',value:`${completion}%`,tone:'violet'},{label:'Quá hạn',value:overdue.length,tone:'red'},
      {label:'Chờ xác nhận',value:waiting.length,tone:'orange'},{label:'Tỷ lệ đúng hạn',value:`${taskOnTimeRate(tasks)}%`,tone:'cyan'}
    ],
    kpiMetrics:[
      {label:'Hồ sơ KPI',value:officialKpis.length,tone:'blue'},{label:'KPI trung bình',value:`${avgKpi}%`,tone:'green'},
      {label:'Vượt KPI',value:exceed,tone:'violet'},{label:'Đã chốt',value:officialKpis.filter(k=>k['Trạng thái KPI']==='Đã chốt').length,tone:'blue'},
      {label:'Đã đánh giá',value:officialKpis.filter(k=>k['Trạng thái KPI']==='Đã đánh giá').length,tone:'orange'},{label:'Mức tối đa',value:'120%',tone:'cyan'}
    ]
  };
}

function a4ReportEnsureChartJs(){
  if(window.Chart)return Promise.resolve();
  return new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{if(window.Chart){clearInterval(timer);resolve();return;}if(++tries>50){clearInterval(timer);reject(new Error('Chart.js chưa tải xong. Vui lòng thử lại.'));}},100);});
}

function a4ReportChartDataUrl(spec,width=700,height=300){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');
  const isDoughnut=spec.type==='doughnut';
  const fontSize=width<=520?9:width<=700?10:11;
  const legendFontSize=width<=520?8:width<=700?9:10;
  const centerValueFont=width<=560?24:30;
  const centerLabelFont=width<=560?14:17;
  const datasets=(spec.datasets||[{label:spec.datasetLabel||'',data:spec.values||[],backgroundColor:spec.colors||A4_REPORT_THEME.blue,borderColor:spec.borderColor||A4_REPORT_THEME.blue}]).map(ds=>Object.assign({borderWidth:isDoughnut?2:(spec.type==='line'?3:0),borderRadius:spec.type==='bar'?5:0},ds));
  const plugins=[];
  if(isDoughnut&&spec.centerValue!==undefined){plugins.push({id:'a4-center-'+Math.random(),afterDraw(chart){const a=chart.getDatasetMeta(0)?.data?.[0];if(!a)return;const c=chart.ctx;c.save();c.textAlign='center';c.textBaseline='middle';c.fillStyle=A4_REPORT_THEME.navy;c.font=`700 ${centerValueFont}px Roboto, Arial`;c.fillText(String(spec.centerValue),a.x,a.y-4);c.fillStyle=A4_REPORT_THEME.muted;c.font=`500 ${centerLabelFont}px Roboto, Arial`;c.fillText(spec.centerLabel||'',a.x,a.y+17);c.restore();}});}
  const chart=new Chart(ctx,{type:spec.type,data:{labels:spec.labels||[],datasets},plugins,options:{
    responsive:false,animation:false,devicePixelRatio:1,maintainAspectRatio:false,indexAxis:spec.indexAxis||'x',
    layout:{padding:{top:4,right:6,bottom:2,left:4}},
    plugins:{legend:{display:spec.legend!==false,position:spec.legendPosition||'bottom',labels:{boxWidth:9,boxHeight:9,usePointStyle:true,pointStyle:'circle',padding:width<=520?8:10,color:A4_REPORT_THEME.muted,font:{family:'Roboto, Arial',size:legendFontSize,weight:'500'}}},tooltip:{enabled:false}},
    cutout:isDoughnut?'62%':undefined,
    scales:isDoughnut?undefined:{x:{beginAtZero:true,max:spec.max||undefined,grid:{color:'#EDF1F7',drawBorder:false},border:{display:false},ticks:{color:A4_REPORT_THEME.muted,font:{family:'Roboto, Arial',size:fontSize},maxRotation:0,minRotation:0}},y:{beginAtZero:true,max:spec.yMax||undefined,grid:{color:spec.indexAxis==='y'?'#EDF1F7':'#F1F4F9',drawBorder:false},border:{display:false},ticks:{color:A4_REPORT_THEME.muted,font:{family:'Roboto, Arial',size:fontSize},autoSkip:false}}},
    elements:{line:{tension:.36,borderWidth:3},point:{radius:4,hoverRadius:4}}
  }});
  chart.update('none');const url=canvas.toDataURL('image/png',1);chart.destroy();return url;
}

function a4ReportChartLabel(value,max=15){
  const words=String(value||'').trim().split(/\s+/).filter(Boolean);
  if(!words.length)return '';
  const lines=[];let line='';
  words.forEach(word=>{const next=line?line+' '+word:word;if(next.length>max&&line){lines.push(line);line=word;}else line=next;});
  if(line)lines.push(line);
  if(lines.length>2)return [lines[0],lines.slice(1).join(' ').slice(0,max-1)+'…'];
  return lines.length>1?lines:lines[0];
}

async function a4ReportBuildChartAssets(data){
  await a4ReportEnsureChartJs();
  const statusColors=data.taskStatus.labels.map(x=>({'Đang thực hiện':'#2F80ED','Chờ xác nhận':'#F59E0B','Chưa bắt đầu':'#A7B2C5','Hoàn thành':'#21B47E','Đã hủy':'#EF476F'}[x]||'#7C5CE7'));
  const classColors=data.kpiClass.labels.map((x,i)=>['#21B47E','#2F80ED','#7C5CE7','#F59E0B','#EF476F','#A7B2C5'][i%6]);
  return {
    trend:data.trend.values.some(v=>Number(v)!==0)?a4ReportChartDataUrl({type:'line',labels:data.trend.labels,datasets:[{label:'KPI trung bình (%)',data:data.trend.values,borderColor:A4_REPORT_THEME.primary,backgroundColor:'rgba(79,70,229,.10)',fill:true,tension:.36,pointBackgroundColor:A4_REPORT_THEME.primary,pointBorderColor:'#fff',pointBorderWidth:2}],legend:true,yMax:120},720,340):'',
    status:data.tasks.length?a4ReportChartDataUrl({type:'doughnut',labels:data.taskStatus.labels,values:data.taskStatus.values,colors:statusColors,centerValue:data.tasks.length,centerLabel:'công việc',legend:true},520,320):'',
    department:data.departmentTasks.length?a4ReportChartDataUrl({type:'bar',labels:data.departmentTasks.map(x=>a4ReportChartLabel(x.label,13)),datasets:[{label:'Hoàn thành',data:data.departmentTasks.map(x=>x.done),backgroundColor:'#32B67A'},{label:'Tổng công việc',data:data.departmentTasks.map(x=>x.total),backgroundColor:'#3D7BEA'}],legend:true},720,340):'',
    taskPriority:data.tasks.length?a4ReportChartDataUrl({type:'bar',indexAxis:'y',labels:data.priorities.map(x=>x.label),values:data.priorities.map(x=>x.value),colors:['#EF476F','#F59E0B','#21B47E','#2F80ED'],legend:false},520,320):'',
    taskStatus:data.tasks.length?a4ReportChartDataUrl({type:'doughnut',labels:data.taskStatus.labels,values:data.taskStatus.values,colors:statusColors,centerValue:data.tasks.length,centerLabel:'công việc'},520,320):'',
    taskGroup:data.taskGroups.length?a4ReportChartDataUrl({type:'bar',indexAxis:'y',labels:data.taskGroups.map(x=>a4ReportChartLabel(x.label,18)),values:data.taskGroups.map(x=>x.value),colors:'#3D7BEA',legend:false},760,280):'',
    kpiPeople:data.kpiPeople.length?a4ReportChartDataUrl({type:'bar',indexAxis:'y',labels:data.kpiPeople.map(x=>a4ReportChartLabel(x.label,20)),values:data.kpiPeople.map(x=>x.value),colors:'#3D7BEA',legend:false,max:120},760,300):'',
    kpiClass:data.officialKpis.length?a4ReportChartDataUrl({type:'doughnut',labels:data.kpiClass.labels,values:data.kpiClass.values,colors:classColors,centerValue:data.officialKpis.length,centerLabel:'hồ sơ KPI'},520,320):'',
    kpiDepartment:data.departmentKpi.length?a4ReportChartDataUrl({type:'bar',indexAxis:'y',labels:data.departmentKpi.map(x=>a4ReportChartLabel(x.label,18)),values:data.departmentKpi.map(x=>x.value),colors:'#32B67A',legend:false,max:120},520,320):''
  };
}

function a4ReportMetricCards(metrics,compact=false){
  const icons={checklist:'▦',check:'✓',clock:'◷',folder:'▱',trend:'↗',people:'✦'};
  return `<div class="a4r-metrics ${compact?'compact':''}">${metrics.map(m=>`<article class="a4r-metric tone-${m.tone||'blue'}"><div class="a4r-metric-icon">${icons[m.icon]||'◆'}</div><div class="a4r-metric-label">${escapeHtml(m.label)}</div><strong>${escapeHtml(m.value)}</strong>${m.note?`<small class="${m.note.tone||'neutral'}">${escapeHtml(m.note.text||m.note)}</small>`:''}</article>`).join('')}</div>`;
}
function a4ReportMiniMetrics(metrics){return `<div class="a4r-mini-metrics">${metrics.map(m=>`<div class="tone-${m.tone||'blue'}"><small>${escapeHtml(m.label)}</small><strong>${escapeHtml(m.value)}</strong></div>`).join('')}</div>`;}
function a4ReportBrand(){return `<div class="a4r-brand"><div class="a4r-logo"><i></i><i></i><i></i><i></i></div><div><b> LỚP 11 | 2026 - 2027</b><span>Quản lý công việc & KPI</span></div></div>`;}
function a4ReportHeader(data){return `<header class="a4r-main-header"><div class="a4r-header-top">${a4ReportBrand()}<span>BÁO CÁO QUẢN TRỊ</span></div><div class="a4r-rule"></div><h1>BÁO CÁO TỔNG HỢP CÔNG VIỆC & KPI</h1><h2>Báo cáo điều hành theo kỳ</h2><div class="a4r-meta"><div><span>▣</span><small>Kỳ báo cáo</small><b>${escapeHtml(data.periodLabel)}</b></div><div><span>◷</span><small>Ngày xuất</small><b>${formatDate(data.exportedAt)}</b></div><div><span>◇</span><small>Người xuất</small><b>${escapeHtml(data.exporter)}</b></div></div></header>`;}
function a4ReportSectionHeader(title,subtitle,periodLabel){return `<header class="a4r-section-header"><div>${a4ReportBrand()}<span>${escapeHtml(periodLabel)}</span></div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></header>`;}
function a4ReportChartCard(title,img,cls='',variant='landscape'){return `<section class="a4r-chart-card ${cls} variant-${variant}"><h3>${escapeHtml(title)}</h3><div class="a4r-chart-media">${img?`<img src="${img}" alt="${escapeAttr(title)}">`:`<div class="a4r-empty-chart">Chưa có dữ liệu phù hợp</div>`}</div></section>`;}
function a4ReportPriorityBlock(data){return `<section class="a4r-priority-card"><h3>Công việc theo ưu tiên</h3><div class="a4r-priority-grid">${data.priorities.map((p,i)=>`<div class="p${i+1}"><span>⌃</span><div><b>${escapeHtml(p.label)}</b><strong>${p.value}</strong></div><em>${p.pct}%</em></div>`).join('')}</div></section>`;}
function a4ReportInsights(data){return `<section class="a4r-insights"><h3>Nhận định nhanh</h3><div class="a4r-insight-head"><span>Nội dung</span><span>Tóm tắt</span></div>${data.insights.map(([a,b],i)=>`<div class="a4r-insight-row"><span><i>${['✓','▱','◆','⚑','↗','◎'][i]}</i>${escapeHtml(a)}</span><p>• ${escapeHtml(b)}</p></div>`).join('')}</section>`;}

function a4ReportTaskRows(tasks){return tasks.map(t=>[t['Mã công việc']||'',`${t['Tên công việc']||''}${t['Mã dự án']?'\n'+projectName(t['Mã dự án']):''}`,employeeName(t['Mã người phụ trách']),formatDate(t['Hạn hoàn thành']),`${isTaskOverdue(t)?'Quá hạn':t['Trạng thái']||''}${t['Mức độ ưu tiên']?' / '+t['Mức độ ưu tiên']:''}`,`${round1(t['Tiến độ (%)']||0)}%`]);}
function a4ReportKpiRows(kpis){return kpis.map(k=>[employeeName(k['Mã nhân sự']),formatPeriod(k['Kỳ']),k['Trạng thái KPI']||'',`${round1(k['Tổng điểm KPI']||0)}/120`,k['Xếp loại']||'',employeeName(k['Mã quản lý đánh giá'])||'']);}
function a4ReportTable(title,columns,rows){return `<section class="a4r-table-block"><h3>${escapeHtml(title)}</h3><table><thead><tr>${columns.map(c=>`<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map((v,i)=>`<td class="c${i}">${escapeHtml(v).replace(/\n/g,'<br>')}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${columns.length}" class="a4r-empty-cell">Chưa có dữ liệu phù hợp với kỳ đang xem.</td></tr>`}</tbody></table></section>`;}
function a4ReportFooter(page,total){return `<footer class="a4r-footer"><span>Báo cáo được tổng hợp từ dữ liệu trong phạm vi quyền truy cập tại thời điểm xuất.</span><b>${String(page).padStart(2,'0')} / ${String(total).padStart(2,'0')}</b></footer>`;}

function renderA4ReportTemplate(data,assets){
  const taskRows=a4ReportTaskRows(data.tasks);
  const kpiRows=a4ReportKpiRows(data.officialKpis);
  const taskFirst=taskRows.slice(0,7),taskRest=taskRows.slice(7);
  const kpiFirst=kpiRows.slice(0,8),kpiRest=kpiRows.slice(8);
  const contents=[];

  contents.push(`${a4ReportHeader(data)}${a4ReportMetricCards(data.metrics)}<div class="a4r-chart-grid overview">${a4ReportChartCard('Xu hướng KPI trung bình theo tháng',assets.trend,'','landscape')} ${a4ReportChartCard('Tình trạng công việc',assets.status,'','square')} ${a4ReportChartCard('Tiến độ công việc theo Nhóm',assets.department,'','landscape')} ${a4ReportPriorityBlock(data)}</div>${a4ReportInsights(data)}`);

  contents.push(`${a4ReportSectionHeader('BÁO CÁO CÔNG VIỆC','Phân tích trạng thái, ưu tiên, khối lượng và danh sách chi tiết theo kỳ đang xem.',data.periodLabel)}${a4ReportMiniMetrics(data.taskMetrics)}<div class="a4r-chart-grid task">${a4ReportChartCard('Công việc theo trạng thái',assets.taskStatus,'','square')} ${a4ReportChartCard('Công việc theo ưu tiên',assets.taskPriority,'','square')} ${a4ReportChartCard('Công việc theo nhóm',assets.taskGroup,'wide','wide')}</div>${a4ReportTable('Bảng chi tiết công việc',['Mã','Công việc / Dự án','Phụ trách','Hạn','Trạng thái / Ưu tiên','Tiến độ'],taskFirst)}`);

  for(let i=0;i<taskRest.length;i+=14){contents.push(`${a4ReportSectionHeader('CHI TIẾT CÔNG VIỆC','Danh sách tiếp theo – header bảng được lặp lại để dễ đối chiếu.',data.periodLabel)}${a4ReportTable('Bảng chi tiết công việc',['Mã','Công việc / Dự án','Phụ trách','Hạn','Trạng thái / Ưu tiên','Tiến độ'],taskRest.slice(i,i+14))}`);}

  contents.push(`${a4ReportSectionHeader('BÁO CÁO KPI','Kết quả KPI chính thức từ hồ sơ Đã đánh giá hoặc Đã chốt trong kỳ.',data.periodLabel)}${a4ReportMiniMetrics(data.kpiMetrics)}<div class="a4r-chart-grid kpi">${a4ReportChartCard('Điểm KPI theo nhân sự',assets.kpiPeople,'wide','wide')} ${a4ReportChartCard('Phân loại KPI',assets.kpiClass,'','square')} ${a4ReportChartCard('KPI trung bình theo Nhóm',assets.kpiDepartment,'','square')}</div>${a4ReportTable('Bảng hồ sơ KPI chính thức',['Nhân sự','Kỳ','Trạng thái','Điểm','Xếp loại','Quản lý'],kpiFirst)}<p class="a4r-kpi-note">* KPI trung bình và xếp loại trong báo cáo chỉ dùng hồ sơ <b>Đã đánh giá</b> hoặc <b>Đã chốt</b>. Điểm tạm tính không được dùng thay điểm chính thức.</p>`);

  for(let i=0;i<kpiRest.length;i+=15){contents.push(`${a4ReportSectionHeader('CHI TIẾT KPI','Danh sách hồ sơ KPI chính thức tiếp theo.',data.periodLabel)}${a4ReportTable('Bảng hồ sơ KPI chính thức',['Nhân sự','Kỳ','Trạng thái','Điểm','Xếp loại','Quản lý'],kpiRest.slice(i,i+15))}`);}

  const total=contents.length;
  return `<div class="a4-report-document">${contents.map((content,i)=>`<div class="a4-report-page"><div class="a4r-page-body">${content}${a4ReportFooter(i+1,total)}</div></div>`).join('')}</div>`;
}

function a4ReportLoadScriptOnce(key,url,test){
  if(test())return Promise.resolve();
  const promiseKey='__a4_report_script_'+key;
  if(window[promiseKey])return window[promiseKey];
  window[promiseKey]=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=url;script.async=true;script.crossOrigin='anonymous';
    script.onload=()=>test()?resolve():reject(new Error('Thư viện '+key+' đã tải nhưng không thể khởi tạo.'));
    script.onerror=()=>reject(new Error('Không thể tải thư viện '+key+'. Vui lòng kiểm tra kết nối mạng.'));
    document.head.appendChild(script);
  });
  return window[promiseKey];
}

function a4ReportEnsurePdfLibraries(){
  return Promise.all([
    a4ReportLoadScriptOnce('html2canvas','https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',()=>typeof window.html2canvas==='function'),
    a4ReportLoadScriptOnce('jspdf','https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',()=>Boolean(window.jspdf&&window.jspdf.jsPDF))
  ]);
}

function a4ReportFileName(periodLabel){return `BAO_CAO_TONG_HOP_CONG_VIEC_KPI_${safeFileName(String(periodLabel||'KY_BAO_CAO').replace(/[\/–—]/g,'_'))}.pdf`;}

async function exportA4DashboardReportPdf(){
  if(APP.state.page!=='dashboard'){showToast('Chỉ xuất tại Dashboard','Vui lòng mở Dashboard trước khi xuất báo cáo tổng hợp.','warning',4200);return;}
  if(!(APP.permissions.isAdmin||APP.permissions.isManager)){showToast('Không có quyền xuất báo cáo','Tính năng này dành cho Quản trị hoặc Quản lý.','error',4500);return;}
  const toastId=showToast('Đang dựng báo cáo PDF...','Đang tổng hợp dữ liệu theo kỳ đang xem và dựng template A4 riêng.','processing',0);
  let stage=null;
  try{
    const data=buildA4ReportData();
    await Promise.all([a4ReportEnsurePdfLibraries(),a4ReportEnsureChartJs(),document.fonts?.ready||Promise.resolve()]);
    const assets=await a4ReportBuildChartAssets(data);
    stage=document.createElement('div');stage.id='a4-report-stage';stage.setAttribute('aria-hidden','true');stage.innerHTML=renderA4ReportTemplate(data,assets);document.body.appendChild(stage);
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

    const pages=[...stage.querySelectorAll('.a4-report-page')];
    if(!pages.length)throw new Error('Không thể dựng trang báo cáo A4.');
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
    for(let i=0;i<pages.length;i++){
      updateToast(toastId,'Đang dựng báo cáo PDF...',`Đang xử lý trang ${i+1}/${pages.length}.`,'processing',0);
      const canvas=await window.html2canvas(pages[i],{scale:2,useCORS:true,backgroundColor:'#FFFFFF',logging:false,scrollX:0,scrollY:0,width:794,height:1122,windowWidth:794,windowHeight:1122});
      const image=canvas.toDataURL('image/jpeg',.97);
      if(i>0)pdf.addPage('a4','portrait');
      pdf.addImage(image,'JPEG',0,0,210,297,undefined,'FAST');
      canvas.width=1;canvas.height=1;
    }
    pdf.save(a4ReportFileName(data.periodLabel));
    updateToast(toastId,'Đã xuất báo cáo PDF',`Báo cáo ${data.periodLabel} đã được tạo theo mẫu A4 chuyên biệt.`,'success',4200);
  }catch(err){console.error('A4 PDF export failed',err);updateToast(toastId,'Không thể xuất báo cáo PDF',err.message||'Đã xảy ra lỗi khi dựng báo cáo.','error',6500);}
  finally{if(stage&&stage.parentNode)stage.remove();}
}

/* ===================== TASK MILESTONES UI 1.5.0 ===================== */
(function(){
  CLIENT_ID_FIELDS.taskMilestones='Mã mốc';
  Object.assign(STATUS_COLORS,{
    'Chưa mở':'gray','Chờ duyệt':'orange','Đã duyệt':'green','Tạm dừng':'gray'
  });
  FIELD_TOOLTIPS.taskMilestones={
    'Tên mốc':'Tên giai đoạn cần hoàn thành trong công việc.',
    'Nội dung yêu cầu':'Mô tả đầu ra hoặc điều kiện cần đạt trước khi gửi duyệt.',
    'Mã người phụ trách':'Người trực tiếp thực hiện mốc này.',
    'Trọng số (%)':'Tỷ trọng của mốc trong tiến độ chung của công việc. Tổng các mốc phải bằng 100%.',
    'Yêu cầu duyệt':'Nếu chọn Có, mốc sau chỉ mở khi Quản lý duyệt mốc hiện tại.',
    'Kết quả thực hiện':'Kết quả đầu ra của riêng mốc tiến độ.',
    'Nhận xét quản lý':'Phản hồi của Quản lý khi duyệt, trả lại hoặc mở lại mốc.'
  };

  APP.state.milestoneEditor=APP.state.milestoneEditor||null;

  const MILESTONE_BASE_ROUTE=routeAction;
  routeAction=async function(action,el,e){
    if(action==='task-milestones-config')return openTaskMilestonesConfig(el.dataset.id||'');
    if(action==='milestone-add-row')return milestoneEditorAdd();
    if(action==='milestone-row-remove')return milestoneEditorRemove(el.dataset.tempid||'');
    if(action==='milestone-row-up')return milestoneEditorMove(el.dataset.tempid||'',-1);
    if(action==='milestone-row-down')return milestoneEditorMove(el.dataset.tempid||'',1);
    if(action==='milestone-balance')return milestoneEditorBalance();
    if(action==='save-task-milestones')return saveTaskMilestonesUi();
    if(action==='milestone-update')return openMilestoneUpdateModal(el.dataset.id||'');
    if(action==='save-milestone-update')return saveMilestoneUpdateUi();
    if(action==='milestone-review')return openMilestoneReviewModal(el.dataset.id||'');
    if(action==='save-milestone-review')return saveMilestoneReviewUi(el);
    if(action==='milestone-reopen')return openMilestoneReopenModal(el.dataset.id||'');
    if(action==='save-milestone-reopen')return saveMilestoneReopenUi();
    return MILESTONE_BASE_ROUTE(action,el,e);
  };

  function taskMilestonesFor(taskId){
    return (APP.data.taskMilestones||[])
      .filter(m=>String(m['Mã công việc']||'')===String(taskId||''))
      .sort((a,b)=>Number(a['Thứ tự mốc']||0)-Number(b['Thứ tự mốc']||0)||String(a['Mã mốc']||'').localeCompare(String(b['Mã mốc']||'')));
  }
  window.taskMilestonesFor=taskMilestonesFor;

  function allMilestonesApprovedUi(taskId){
    const rows=taskMilestonesFor(taskId).filter(m=>m['Trạng thái mốc']!=='Đã hủy');
    return rows.length>0&&rows.every(m=>m['Trạng thái mốc']==='Đã duyệt');
  }
  function milestoneCanWork(m){
    const task=(APP.data.tasks||[]).find(t=>t['Mã công việc']===m['Mã công việc']);
    return Boolean(APP.permissions.canManageTasks ||
      String(m['Mã người phụ trách']||'')===String(APP.session?.employeeId||'') ||
      String(task?.['Mã người phụ trách']||'')===String(APP.session?.employeeId||''));
  }
  function milestoneCanReopen(m,rows,task){
    if(!APP.permissions.canConfirmTask||m['Trạng thái mốc']!=='Đã duyệt'||task?.['Trạng thái']==='Hoàn thành')return false;
    return rows.filter(x=>Number(x['Thứ tự mốc']||0)>Number(m['Thứ tự mốc']||0)).every(x=>x['Trạng thái mốc']==='Chưa mở');
  }
  function milestoneIcon(status){
    return status==='Đã duyệt'?'verified':status==='Chờ duyệt'?'hourglass_top':status==='Đang thực hiện'?'play_circle':status==='Tạm dừng'?'pause_circle':'lock';
  }
  function milestoneProgress(m){return m['Trạng thái mốc']==='Đã duyệt'?100:clamp(Number(m['Tiến độ mốc (%)']||0),0,100);}
  function milestoneTaskSummary(taskId){
    const rows=taskMilestonesFor(taskId);
    if(!rows.length)return '';
    const done=rows.filter(m=>m['Trạng thái mốc']==='Đã duyệt').length;
    const waiting=rows.filter(m=>m['Trạng thái mốc']==='Chờ duyệt').length;
    const active=rows.find(m=>m['Trạng thái mốc']==='Đang thực hiện'||m['Trạng thái mốc']==='Chờ duyệt');
    return `<span class="milestone-summary-chip ${waiting?'waiting':''}" title="Tiến độ theo mốc"><span class="material-symbols-rounded">route</span>${done}/${rows.length} mốc${waiting?` · ${waiting} chờ duyệt`:active?` · ${escapeHtml(active['Tên mốc'])}`:''}</span>`;
  }

  function renderMilestoneTimeline(taskId){
    const rows=taskMilestonesFor(taskId);
    const task=(APP.data.tasks||[]).find(t=>t['Mã công việc']===taskId);
    if(!rows.length){
      return `<div class="milestone-empty">${emptyState('route','Chưa thiết lập mốc tiến độ','Công việc này đang dùng luồng tiến độ chung. Quản lý có thể tạo 2–10 mốc để duyệt tuần tự.')}${APP.permissions.canManageTasks&&task?.['Trạng thái']!=='Hoàn thành'?`<button class="btn btn-primary" data-action="task-milestones-config" data-id="${escapeAttr(taskId)}"><span class="material-symbols-rounded">add_road</span>Thiết lập mốc tiến độ</button>`:''}</div>`;
    }
    const done=rows.filter(m=>m['Trạng thái mốc']==='Đã duyệt').length;
    const waiting=rows.filter(m=>m['Trạng thái mốc']==='Chờ duyệt').length;
    const totalWeight=round1(rows.reduce((s,m)=>s+Number(m['Trọng số (%)']||0),0));
    return `<div class="milestone-head-panel"><div><strong>${done}/${rows.length} mốc đã duyệt</strong><small>${waiting?waiting+' mốc đang chờ Quản lý':'Mốc sau chỉ mở khi mốc trước hoàn tất đúng điều kiện.'}</small></div><div class="milestone-head-stats"><span>${totalWeight}% trọng số</span>${statusBadge(task?.['Trạng thái']||'')}</div></div>
      <div class="milestone-timeline">${rows.map((m,i)=>renderMilestoneCard(m,i,rows,task)).join('')}</div>`;
  }

  function renderMilestoneCard(m,index,rows,task){
    const status=m['Trạng thái mốc']||'Chưa mở';
    const progress=milestoneProgress(m);
    let action='';
    if(status==='Đang thực hiện'&&milestoneCanWork(m)){
      action=`<button class="btn btn-sm btn-primary" data-action="milestone-update" data-id="${escapeAttr(m['Mã mốc'])}"><span class="material-symbols-rounded">edit_note</span>Cập nhật mốc</button>`;
    }else if(status==='Chờ duyệt'&&APP.permissions.canConfirmTask){
      action=`<button class="btn btn-sm btn-success" data-action="milestone-review" data-id="${escapeAttr(m['Mã mốc'])}"><span class="material-symbols-rounded">fact_check</span>Duyệt / Trả lại</button>`;
    }else if(milestoneCanReopen(m,rows,task)){
      action=`<button class="btn btn-sm" data-action="milestone-reopen" data-id="${escapeAttr(m['Mã mốc'])}"><span class="material-symbols-rounded">restart_alt</span>Mở lại mốc</button>`;
    }
    const locked=status==='Chưa mở';
    return `<article class="milestone-card status-${normalizeText(status).replace(/\s+/g,'-')} ${locked?'locked':''}">
      <div class="milestone-rail"><span class="milestone-dot"><span class="material-symbols-rounded">${milestoneIcon(status)}</span></span>${index<rows.length-1?'<span class="milestone-line"></span>':''}</div>
      <div class="milestone-body">
        <div class="milestone-card-head"><div><span class="milestone-order">Mốc ${index+1}</span><h3>${escapeHtml(m['Tên mốc'])}</h3></div><div class="milestone-card-actions">${statusBadge(status)}${action}</div></div>
        <div class="milestone-meta-row"><span><b>Phụ trách:</b> ${escapeHtml(employeeName(m['Mã người phụ trách'])||m['Mã người phụ trách']||'-')}</span><span><b>Thời gian:</b> ${formatDate(m['Ngày bắt đầu'])||'-'} → ${formatDate(m['Hạn hoàn thành'])||'-'}</span><span><b>Trọng số:</b> ${round1(m['Trọng số (%)']||0)}%</span><span><b>Duyệt:</b> ${escapeHtml(m['Yêu cầu duyệt']||'Có')}</span></div>
        ${m['Nội dung yêu cầu']?`<p class="milestone-requirement">${escapeHtml(m['Nội dung yêu cầu'])}</p>`:''}
        <div class="milestone-progress-row"><div class="progress"><span style="width:${progress}%"></span></div><strong>${round1(progress)}%</strong></div>
        ${m['Kết quả thực hiện']?`<div class="milestone-result"><b>Kết quả:</b><span>${escapeHtml(m['Kết quả thực hiện'])}</span></div>`:''}
        ${m['Nhận xét quản lý']?`<div class="milestone-review-note"><span class="material-symbols-rounded">reviews</span><div><b>${escapeHtml(m['Hành động quản lý']||'Nhận xét quản lý')}</b><p>${escapeHtml(m['Nhận xét quản lý'])}</p>${m['Ngày duyệt']?`<small>${formatDateTime(m['Ngày duyệt'])}</small>`:''}</div></div>`:''}
        ${locked?`<div class="milestone-lock-note"><span class="material-symbols-rounded">lock</span>Chưa thể thực hiện. Cần hoàn tất/duyệt mốc trước.</div>`:''}
      </div>
    </article>`;
  }

  // Ghi đè hồ sơ công việc: giữ tách Kết quả/Nhận xét quản lý và thêm tab Mốc tiến độ.
  renderTaskProfile=function(id,tab){
    const t=(APP.data.tasks||[]).find(x=>x['Mã công việc']===id);if(!t)return;
    const participants=(APP.data.taskParticipants||[]).filter(p=>p['Mã công việc']===id),files=filesFor('Công việc',id);
    const milestones=taskMilestonesFor(id);
    const approvalActions=new Set(['Xác nhận hoàn thành','Trả lại','Mở lại công việc']);
    const approvalHistory=(APP.data.audit||[]).filter(a=>a['Module']==='Công việc'&&String(a['Mã bản ghi'])===String(id)&&approvalActions.has(a['Hành động']))
      .sort((a,b)=>(parseDate(b['Thời gian'])?.getTime()||0)-(parseDate(a['Thời gian'])?.getTime()||0));
    let content='';
    if(tab==='milestones'){
      content=renderMilestoneTimeline(id);
    }else if(tab==='people'){
      content=`<div class="profile-info-grid"><section class="profile-info-panel"><h3>Người phụ trách chính</h3>${personInline(t['Mã người phụ trách'])}</section><section class="profile-info-panel wide"><h3>Người tham gia</h3>${participants.length?participants.map(p=>`<div class="profile-person-line">${personInline(p['Mã nhân sự'])}<span>${statusBadge(p['Vai trò tham gia'])}${statusBadge(p['Trạng thái'])}</span></div>`).join(''):emptyState('group','Chưa có người tham gia','Công việc hiện chỉ có người phụ trách chính.')}</section></div>`;
    }else if(tab==='files'){
      content=files.length?`<div class="file-list">${files.map(fileCard).join('')}</div>`:emptyState('attach_file','Chưa có tài liệu','File công việc sẽ hiển thị ở đây.');
    }else{
      const managerReview=t['Nhận xét quản lý']||'Chưa có nhận xét của quản lý.';
      const managerAction=t['Hành động quản lý']||'Chưa có';
      const managerDate=t['Ngày phản hồi quản lý']?formatDateTime(t['Ngày phản hồi quản lý']):'';
      content=`<div class="profile-hero-v2 task"><div class="hero-icon"><span class="material-symbols-rounded">task_alt</span></div><div><h2>${escapeHtml(t['Tên công việc'])}</h2><p>${escapeHtml(t['Mã công việc'])} · ${escapeHtml(projectName(t['Mã dự án']))} · ${escapeHtml(employeeName(t['Mã người phụ trách']))}</p><div class="hero-badges">${statusBadge(isTaskOverdue(t)?'Quá hạn':t['Trạng thái'])}${statusBadge(t['Mức độ ưu tiên'])}${milestoneTaskSummary(id)}</div></div><div class="hero-score"><strong>${round1(t['Tiến độ (%)']||0)}%</strong><small>${milestones.length?'Theo mốc':'Tiến độ'}</small></div></div>
      <div class="profile-stats-v2">${reportMetric('Mốc tiến độ',milestones.length,'route','blue')}${reportMetric('Mốc đã duyệt',milestones.filter(m=>m['Trạng thái mốc']==='Đã duyệt').length,'verified','green')}${reportMetric('Chờ duyệt mốc',milestones.filter(m=>m['Trạng thái mốc']==='Chờ duyệt').length,'hourglass_top','orange')}${reportMetric('Hạn hoàn thành',formatDate(t['Hạn hoàn thành']),'event','violet')}</div>
      <div class="profile-info-grid"><section class="profile-info-panel"><h3>Luồng xử lý</h3>${infoKV('Ngày bắt đầu',formatDate(t['Ngày bắt đầu']))}${infoKV('Người giao việc',escapeHtml(employeeName(t['Mã người giao việc'])||t['Mã người giao việc']))}${infoKV('Quản lý xác nhận',escapeHtml(employeeName(t['Mã quản lý xác nhận'])||'-'))}</section><section class="profile-info-panel wide"><h3>Yêu cầu công việc</h3><div class="task-rich-content">${safeRichHtml(t['Mô tả']||'Chưa có mô tả.')}</div><div class="task-rich-content"><b>Ghi chú:</b>${safeRichHtml(t['Ghi chú']||'Không có ghi chú.')}</div></section></div>
      <div class="profile-info-grid" style="margin-top:12px"><section class="profile-info-panel wide"><h3>Kết quả thực hiện</h3><div class="task-rich-content">${safeRichHtml(t['Kết quả']||'Chưa cập nhật kết quả.')}</div></section><section class="profile-info-panel wide"><h3>Nhận xét của quản lý</h3><p style="white-space:pre-wrap">${escapeHtml(managerReview)}</p><small><b>Hành động gần nhất:</b> ${escapeHtml(managerAction)}${managerDate?` · ${escapeHtml(managerDate)}`:''}</small></section></div>
      <div class="profile-section"><h3>Lịch sử xác nhận công việc</h3>${approvalHistory.length?approvalHistory.map(a=>`<div class="action-card blue"><div class="action-card-icon"><span class="material-symbols-rounded">${a['Hành động']==='Xác nhận hoàn thành'?'verified':a['Hành động']==='Mở lại công việc'?'restart_alt':'undo'}</span></div><div><strong>${escapeHtml(a['Hành động'])}</strong><p>${escapeHtml(formatDateTime(a['Thời gian']))}${a['Nội dung thay đổi']?` · ${escapeHtml(a['Nội dung thay đổi'])}`:''}</p></div></div>`).join(''):'<p class="muted">Chưa có lịch sử xác nhận, trả lại hoặc mở lại.</p>'}</div>`;
    }

    let workflowButton='';
    if(t['Trạng thái']==='Chờ xác nhận'&&APP.permissions.canConfirmTask){
      workflowButton=`<button class="btn btn-success" data-action="confirm-task" data-id="${id}"><span class="material-symbols-rounded">fact_check</span>Xác nhận / Trả lại</button>`;
    }else if(t['Trạng thái']==='Hoàn thành'&&APP.permissions.canConfirmTask){
      workflowButton=`<button class="btn" data-action="reopen-task" data-id="${id}"><span class="material-symbols-rounded">restart_alt</span>Mở lại công việc</button>`;
    }else{
      workflowButton=`<button class="btn" data-action="task-status" data-id="${id}"><span class="material-symbols-rounded">sync_alt</span>Cập nhật trạng thái</button>`;
    }
    const configButton=APP.permissions.canManageTasks&&t['Trạng thái']!=='Hoàn thành'&&t['Trạng thái']!=='Đã hủy'
      ?`<button class="btn" data-action="task-milestones-config" data-id="${id}"><span class="material-symbols-rounded">route</span>${milestones.length?'Thiết lập mốc':'Tạo mốc tiến độ'}</button>`:'';
    openModal(richModal('Hồ sơ công việc','Thông tin, mốc tiến độ, kết quả, nhận xét quản lý và tài liệu.','task',id,[['overview','Tổng quan'],['milestones',`Mốc tiến độ${milestones.length?` (${milestones.length})`:''}`],['people','Người tham gia'],['files','Tài liệu']],tab,content,`${configButton}${workflowButton}${canEditTask(t)?`<button class="btn btn-primary" data-action="edit-task" data-id="${id}"><span class="material-symbols-rounded">edit</span>Chỉnh sửa</button>`:''}<button class="btn" data-action="close-modal">Đóng</button>`));
  };

  // Bảng công việc hiển thị nhanh trạng thái mốc.
  renderTasksTable=function(rows,module='tasks',selectable=true){
    if(!rows.length)return emptyState('task_alt','Không có công việc','Không tìm thấy công việc phù hợp với kỳ hoặc bộ lọc đang chọn.');
    const state=visibleSelectionState(module,rows);
    return `<div class="data-table-wrap"><table class="data-table data-table-v2 task-table" style="min-width:1240px"><thead><tr>${selectable?`<th class="select-col"><input class="check" type="checkbox" data-select-all data-module="${module}" ${state.all?'checked':''}></th>`:''}<th style="width:154px">Thao tác</th><th>Công việc</th><th>Dự án</th><th>Người phụ trách</th><th>Hạn hoàn thành</th><th>Ưu tiên</th><th>Trạng thái</th><th>Tiến độ</th></tr></thead><tbody>${rows.map(t=>{const overdue=isTaskOverdue(t);const id=t['Mã công việc'];let flow='';if(t['Trạng thái']==='Chờ xác nhận'&&APP.permissions.canConfirmTask)flow=`<button class="row-action confirm" data-action="confirm-task" data-id="${id}" title="Xác nhận"><span class="material-symbols-rounded">fact_check</span></button>`;else if(t['Trạng thái']==='Hoàn thành'&&APP.permissions.canConfirmTask)flow=`<button class="row-action status" data-action="reopen-task" data-id="${id}" title="Mở lại"><span class="material-symbols-rounded">restart_alt</span></button>`;else flow=`<button class="row-action status" data-action="task-status" data-id="${id}" title="Cập nhật trạng thái"><span class="material-symbols-rounded">sync_alt</span></button>`;return `<tr>${selectable?`<td class="select-col"><input class="check" type="checkbox" data-row-select data-module="${module}" data-id="${id}" ${isSelected(module,id)?'checked':''}></td>`:''}<td><div class="row-actions row-actions-color"><button class="row-action view" data-action="view-task" data-id="${id}" title="Xem hồ sơ"><span class="material-symbols-rounded">visibility</span></button>${canEditTask(t)?`<button class="row-action edit" data-action="edit-task" data-id="${id}" title="Sửa"><span class="material-symbols-rounded">edit</span></button>`:''}${flow}${APP.permissions.canSendReminders&&!['Hoàn thành','Đã hủy'].includes(t['Trạng thái'])?`<button class="row-action reminder" data-action="send-task-reminder" data-id="${id}" title="Gửi nhắc việc"><span class="material-symbols-rounded">notifications_active</span></button>`:''}</div></td><td class="main-cell"><strong>${escapeHtml(t['Tên công việc'])}</strong><small>${escapeHtml(id)} · ${escapeHtml(t['Nhóm công việc'])}</small>${milestoneTaskSummary(id)}</td><td><strong style="font-size:11.5px">${escapeHtml(projectName(t['Mã dự án']))}</strong><small style="display:block;color:var(--muted)">${escapeHtml(t['Mã dự án'])}</small></td><td>${personInline(t['Mã người phụ trách'])}</td><td class="${overdue?'text-danger':''}"><strong style="font-size:11.5px">${formatDate(t['Hạn hoàn thành'])}</strong>${overdue?'<small style="display:block">Quá hạn</small>':''}</td><td>${statusBadge(t['Mức độ ưu tiên'])}</td><td>${statusBadge(overdue?'Quá hạn':t['Trạng thái'])}</td><td><div style="min-width:110px"><div class="progress"><span style="width:${clamp(Number(t['Tiến độ (%)']||0),0,100)}%"></span></div><small style="display:block;margin-top:3px;color:var(--muted)">${round1(t['Tiến độ (%)']||0)}%${taskMilestonesFor(id).length?' · theo mốc':''}</small></div></td></tr>`}).join('')}</tbody></table></div>`;
  };

  const MILESTONE_BASE_ACTION_CENTER=renderActionCenter;
  renderActionCenter=function(){
    const tasks=APP.data.tasks||[],kpis=APP.data.kpiMonths||[],milestones=APP.data.taskMilestones||[];
    const overdue=tasks.filter(isTaskOverdue),waiting=tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận'),near=tasks.filter(isTaskNearDue),kpiPending=kpis.filter(k=>['Chờ quản lý duyệt','Đã đánh giá'].includes(k['Trạng thái KPI']));
    const milestoneWaiting=milestones.filter(m=>m['Trạng thái mốc']==='Chờ duyệt');
    document.getElementById('page-content').innerHTML=`<div class="page-shell action-center-v2">${pageHead('Việc cần xử lý','Bảng điều phối ưu tiên theo hạn, duyệt mốc, xác nhận công việc và KPI')}<div class="action-summary-grid milestone-summary-grid">${reportMetric('Quá hạn',overdue.length,'schedule','red','Cần xử lý trước')}${reportMetric('Mốc chờ duyệt',milestoneWaiting.length,'route','orange','Duyệt để mở mốc sau')}${reportMetric('Chờ xác nhận',waiting.length,'hourglass_top','orange','Xác nhận toàn việc')}${reportMetric('Sắp đến hạn',near.length,'event_upcoming','blue','Trong 7 ngày')}${reportMetric('KPI cần xử lý',kpiPending.length,'speed','violet','Đánh giá/chốt')}</div><div class="action-board milestone-action-board"><section class="panel action-lane danger"><div class="lane-head"><div><h2>Công việc quá hạn</h2><small>${overdue.length} mục cần ưu tiên</small></div><span class="badge badge-red">${overdue.length}</span></div>${renderActionCardsV2(overdue,'danger')}</section><section class="panel action-lane warning milestone-lane"><div class="lane-head"><div><h2>Mốc chờ duyệt</h2><small>Duyệt xong mới mở mốc tiếp theo</small></div><span class="badge badge-orange">${milestoneWaiting.length}</span></div>${milestoneWaiting.length?milestoneWaiting.slice(0,12).map(m=>{const t=tasks.find(x=>x['Mã công việc']===m['Mã công việc']);return `<article class="action-ticket warning"><div class="ticket-icon"><span class="material-symbols-rounded">route</span></div><div class="ticket-main"><strong>${escapeHtml(m['Tên mốc'])}</strong><p>${escapeHtml(t?.['Tên công việc']||m['Mã công việc'])} · ${escapeHtml(employeeName(m['Mã người phụ trách']))}</p><div class="ticket-meta"><span>Mốc ${Number(m['Thứ tự mốc']||0)}</span>${statusBadge('Chờ duyệt')}</div></div><button class="row-action view" data-action="${APP.permissions.canConfirmTask?'milestone-review':'view-task'}" data-id="${APP.permissions.canConfirmTask?escapeAttr(m['Mã mốc']):escapeAttr(m['Mã công việc'])}"><span class="material-symbols-rounded">arrow_forward</span></button></article>`}).join(''):emptyState('done_all','Không có mốc chờ duyệt','Các mốc Nhóm gửi duyệt sẽ xuất hiện tại đây.')}</section><section class="panel action-lane warning"><div class="lane-head"><div><h2>Chờ xác nhận toàn việc</h2><small>Tất cả mốc đã hoàn tất</small></div><span class="badge badge-orange">${waiting.length}</span></div>${renderActionCardsV2(waiting,'warning')}</section><section class="panel action-lane info"><div class="lane-head"><div><h2>Sắp đến hạn</h2><small>Theo dõi 7 ngày tới</small></div><span class="badge badge-blue">${near.length}</span></div>${renderActionCardsV2(near,'info')}</section><section class="panel action-lane kpi"><div class="lane-head"><div><h2>KPI cần xử lý</h2><small>Đánh giá hoặc chốt KPI</small></div><span class="badge badge-violet">${kpiPending.length}</span></div>${kpiPending.length?kpiPending.slice(0,12).map(k=>`<article class="action-ticket kpi"><div class="ticket-icon"><span class="material-symbols-rounded">speed</span></div><div class="ticket-main"><strong>${escapeHtml(employeeName(k['Mã nhân sự']))}</strong><p>${formatPeriod(k['Kỳ'])} · ${escapeHtml(k['Trạng thái KPI'])} · ${round1(k['Tổng điểm KPI']||0)}/120</p></div><button class="row-action view" data-action="${k['Trạng thái KPI']==='Đã đánh giá'?'finalize-kpi':'evaluate-kpi'}" data-id="${k['Mã KPI tháng']}"><span class="material-symbols-rounded">arrow_forward</span></button></article>`).join(''):emptyState('done_all','Không có KPI cần xử lý','Các KPI chờ đánh giá hoặc chốt sẽ xuất hiện tại đây.')}</section></div></div>`;
  };

  renderNotificationPopover=function(){
    const tasks=APP.data.tasks||[],milestones=APP.data.taskMilestones||[];
    const overdue=tasks.filter(isTaskOverdue),waiting=tasks.filter(t=>t['Trạng thái']==='Chờ xác nhận'),near=tasks.filter(isTaskNearDue);
    const milestoneWaiting=milestones.filter(m=>m['Trạng thái mốc']==='Chờ duyệt'&&APP.permissions.canConfirmTask);
    const total=overdue.length+waiting.length+near.length+milestoneWaiting.length;
    const items=[
      ...milestoneWaiting.slice(0,4).map(m=>({type:'orange',icon:'route',title:'Mốc chờ duyệt',text:m['Tên mốc'],sub:`${(APP.data.tasks||[]).find(t=>t['Mã công việc']===m['Mã công việc'])?.['Tên công việc']||m['Mã công việc']} · ${employeeName(m['Mã người phụ trách'])}`,action:'milestone-review',id:m['Mã mốc']})),
      ...overdue.slice(0,4).map(t=>({type:'red',icon:'schedule',title:'Quá hạn',text:t['Tên công việc'],sub:`Hạn ${formatDate(t['Hạn hoàn thành'])} · ${employeeName(t['Mã người phụ trách'])}`,action:'view-task',id:t['Mã công việc']})),
      ...waiting.slice(0,3).map(t=>({type:'orange',icon:'hourglass_top',title:'Chờ xác nhận',text:t['Tên công việc'],sub:`${employeeName(t['Mã người phụ trách'])} đã gửi kiểm tra`,action:APP.permissions.canConfirmTask?'confirm-task':'view-task',id:t['Mã công việc']})),
      ...near.slice(0,3).map(t=>({type:'blue',icon:'event_upcoming',title:'Sắp đến hạn',text:t['Tên công việc'],sub:`Hạn ${formatDate(t['Hạn hoàn thành'])}`,action:'view-task',id:t['Mã công việc']}))
    ].slice(0,10);
    const body=items.length?items.map(it=>`<button class="notification-item-v2 ${it.type}" data-action="${it.action}" data-id="${escapeAttr(it.id)}"><span class="notification-type"><span class="material-symbols-rounded">${it.icon}</span></span><span class="notification-copy"><b>${escapeHtml(it.title)}</b><strong>${escapeHtml(it.text)}</strong><small>${escapeHtml(it.sub)}</small></span><span class="material-symbols-rounded arrow">chevron_right</span></button>`).join(''):emptyState('notifications_none','Không có thông báo','Các việc quá hạn, mốc chờ duyệt hoặc công việc chờ xác nhận sẽ hiển thị tại đây.');
    return `<div class="notification-popover-v2"><div class="notification-popover-head-v2"><div><strong>Thông báo công việc</strong><small>Tập trung việc cần chú ý trong kỳ đang xem</small></div><span class="notification-total">${total}</span></div><div class="notification-mini-stats"><span class="orange">${milestoneWaiting.length} mốc chờ duyệt</span><span class="red">${overdue.length} quá hạn</span><span class="orange">${waiting.length} chờ xác nhận</span><span class="blue">${near.length} sắp đến hạn</span></div><div class="notification-list-v2">${body}</div><div class="notification-popover-foot-v2"><button class="btn btn-sm" data-action="refresh-data"><span class="material-symbols-rounded">refresh</span>Làm mới</button><button class="btn btn-primary btn-sm" data-page="action-center"><span class="material-symbols-rounded">open_in_new</span>Xem tất cả</button></div></div>`;
  };

  updateActionCounts=function(){
    const tasks=APP.data.tasks||[];
    const milestoneWaiting=APP.permissions.canConfirmTask?(APP.data.taskMilestones||[]).filter(m=>m['Trạng thái mốc']==='Chờ duyệt').length:0;
    const count=tasks.filter(t=>isTaskOverdue(t)||t['Trạng thái']==='Chờ xác nhận'||isTaskNearDue(t)).length+milestoneWaiting;
    setText('nav-action-count',count);setText('notification-count',count);
    const pop=document.getElementById('notification-popover');if(pop&&!pop.classList.contains('hidden'))pop.innerHTML=renderNotificationPopover();
  };

  // Khi có mốc, tiến độ công việc là tự động; trạng thái Chờ xác nhận chỉ mở khi tất cả mốc đã duyệt.
  openTaskStatusModal=function(id){
    const t=(APP.data.tasks||[]).find(x=>x['Mã công việc']===id);if(!t)return;
    const milestones=taskMilestonesFor(id),allApproved=allMilestonesApprovedUi(id);
    let allowed=APP.session.role==='Nhóm'?['Chưa bắt đầu','Đang thực hiện','Chờ xác nhận']:(APP.data.fixedOptions?.taskStatus||[]);
    if(milestones.length&&!allApproved)allowed=allowed.filter(s=>!['Chờ xác nhận','Hoàn thành'].includes(s));
    const milestoneNote=milestones.length?`<div class="form-section milestone-status-note"><div class="form-section-title"><span class="material-symbols-rounded">route</span>Tiến độ đang quản lý theo mốc</div><p>Tiến độ tổng được hệ thống tính tự động từ ${milestones.length} mốc. ${allApproved?'Tất cả mốc đã duyệt, có thể gửi Chờ xác nhận.':'Cần hoàn tất và duyệt toàn bộ mốc trước khi gửi xác nhận toàn công việc.'}</p></div>`:'';
    const body=`${milestoneNote}<div class="form-grid">${formField('tasks','Trạng thái',comboHtml('Trạng thái',t['Trạng thái'],allowed,'Chọn trạng thái'),milestones.length?'Trạng thái cuối phụ thuộc luồng duyệt mốc.':'Nhóm làm xong cần chuyển Chờ xác nhận.',false,true)}${formField('tasks','Tiến độ (%)',textInput('Tiến độ (%)',t['Tiến độ (%)']||0,'0 - 100','number',milestones.length?'readonly':'min="0" max="100"'),milestones.length?'Tự động tính từ trọng số và tiến độ các mốc.':'Nhập tiến độ từ 0 đến 100%.')}${formField('tasks','Kết quả',textArea('Kết quả',t['Kết quả'],'Mô tả kết quả tổng hợp đã thực hiện...'),'Kết quả tổng hợp của toàn công việc.',true)}<input type="hidden" data-field="Mã công việc" value="${escapeAttr(id)}"></div>`;
    openModal(modalShell('Cập nhật công việc',t['Tên công việc'],body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-task-status">Cập nhật</button>`,'small'));
  };

  function milestoneEditorBlank(taskId,index){
    const task=(APP.data.tasks||[]).find(t=>t['Mã công việc']===taskId)||{};
    return {__tempId:'ms_'+Date.now()+'_'+Math.random().toString(36).slice(2,7)+'_'+index,'Mã mốc':'','Mã công việc':taskId,'Tên mốc':'','Nội dung yêu cầu':'','Mã người phụ trách':task['Mã người phụ trách']||APP.session?.employeeId||'','Ngày bắt đầu':toDateInput(task['Ngày bắt đầu']||new Date()),'Hạn hoàn thành':toDateInput(task['Hạn hoàn thành']||new Date()),'Trọng số (%)':'','Yêu cầu duyệt':'Có','Ghi chú':'','Trạng thái mốc':'Chưa mở','Tiến độ mốc (%)':0};
  }
  function milestoneEditorFromRecord(m,index){
    return {...m,__tempId:'ms_'+(m['Mã mốc']||index),'Ngày bắt đầu':toDateInput(m['Ngày bắt đầu']),'Hạn hoàn thành':toDateInput(m['Hạn hoàn thành'])};
  }
  function openTaskMilestonesConfig(taskId){
    const task=(APP.data.tasks||[]).find(t=>t['Mã công việc']===taskId);if(!task)return;
    if(!APP.permissions.canManageTasks){showToast('Không có quyền','Chỉ Quản trị hoặc Quản lý được thiết lập mốc.','warning');return;}
    const existing=taskMilestonesFor(taskId);
    APP.state.milestoneEditor={taskId,rows:existing.length?existing.map(milestoneEditorFromRecord):[milestoneEditorBlank(taskId,0)]};
    if(!existing.length)milestoneEditorBalance(false);
    renderMilestoneEditor();
  }
  function syncMilestoneEditor(){
    const ed=APP.state.milestoneEditor;if(!ed)return;
    ed.rows.forEach(r=>{
      const q=(f)=>[...document.querySelectorAll('[data-ms-tempid][data-ms-field]')].find(el=>el.dataset.msTempid===r.__tempId&&el.dataset.msField===f);
      ['Tên mốc','Nội dung yêu cầu','Mã người phụ trách','Ngày bắt đầu','Hạn hoàn thành','Trọng số (%)','Yêu cầu duyệt','Ghi chú'].forEach(f=>{const el=q(f);if(el)r[f]=el.value;});
    });
  }
  function milestonePersonSelect(r){
    return `<select class="milestone-input" data-ms-tempid="${escapeAttr(r.__tempId)}" data-ms-field="Mã người phụ trách">${(APP.data.employees||[]).map(e=>`<option value="${escapeAttr(e['Mã nhân sự'])}" ${String(e['Mã nhân sự'])===String(r['Mã người phụ trách'])?'selected':''}>${escapeHtml(e['Mã nhân sự']+' - '+e['Họ và tên'])}</option>`).join('')}</select>`;
  }
  function renderMilestoneEditor(){
    const ed=APP.state.milestoneEditor;if(!ed)return;
    const task=(APP.data.tasks||[]).find(t=>t['Mã công việc']===ed.taskId)||{};
    const total=round1(ed.rows.reduce((s,r)=>s+Number(r['Trọng số (%)']||0),0));
    const body=`<div class="milestone-editor-toolbar"><div><strong>${escapeHtml(task['Tên công việc']||ed.taskId)}</strong><small>Mốc sau chỉ được mở khi mốc trước đã hoàn tất/được duyệt.</small></div><div><span class="milestone-weight-total ${Math.abs(total-100)>.1?'invalid':''}">Tổng trọng số: ${total}%</span><button class="btn btn-sm" data-action="milestone-balance"><span class="material-symbols-rounded">balance</span>Chia đều</button><button class="btn btn-sm btn-primary" data-action="milestone-add-row"><span class="material-symbols-rounded">add</span>Thêm mốc</button></div></div><div class="milestone-editor-list">${ed.rows.map((r,i)=>`<article class="milestone-editor-card"><div class="milestone-editor-index"><span>${i+1}</span><div class="row-actions"><button class="row-action" data-action="milestone-row-up" data-tempid="${escapeAttr(r.__tempId)}" ${i===0?'disabled':''} title="Lên"><span class="material-symbols-rounded">arrow_upward</span></button><button class="row-action" data-action="milestone-row-down" data-tempid="${escapeAttr(r.__tempId)}" ${i===ed.rows.length-1?'disabled':''} title="Xuống"><span class="material-symbols-rounded">arrow_downward</span></button>${r['Trạng thái mốc']==='Chưa mở'||!r['Mã mốc']?`<button class="row-action danger" data-action="milestone-row-remove" data-tempid="${escapeAttr(r.__tempId)}" title="Xóa"><span class="material-symbols-rounded">delete</span></button>`:''}</div></div><div class="milestone-editor-fields"><div class="form-field span-2"><label>Tên mốc <span class="required">*</span></label><input class="milestone-input" data-ms-tempid="${escapeAttr(r.__tempId)}" data-ms-field="Tên mốc" value="${escapeAttr(r['Tên mốc']||'')}" placeholder="Ví dụ: Lập kế hoạch / Duyệt nội dung"></div><div class="form-field"><label>Người phụ trách</label>${milestonePersonSelect(r)}</div><div class="form-field"><label>Trọng số (%)</label><input class="milestone-input" type="number" min="0.01" max="100" step="0.01" data-ms-tempid="${escapeAttr(r.__tempId)}" data-ms-field="Trọng số (%)" value="${escapeAttr(r['Trọng số (%)']??'')}"></div><div class="form-field"><label>Ngày bắt đầu</label><input class="milestone-input" type="date" data-ms-tempid="${escapeAttr(r.__tempId)}" data-ms-field="Ngày bắt đầu" value="${escapeAttr(r['Ngày bắt đầu']||'')}"></div><div class="form-field"><label>Hạn hoàn thành</label><input class="milestone-input" type="date" data-ms-tempid="${escapeAttr(r.__tempId)}" data-ms-field="Hạn hoàn thành" value="${escapeAttr(r['Hạn hoàn thành']||'')}"></div><div class="form-field"><label>Yêu cầu quản lý duyệt</label><select class="milestone-input" data-ms-tempid="${escapeAttr(r.__tempId)}" data-ms-field="Yêu cầu duyệt"><option value="Có" ${r['Yêu cầu duyệt']!=='Không'?'selected':''}>Có - phải duyệt mới mở mốc sau</option><option value="Không" ${r['Yêu cầu duyệt']==='Không'?'selected':''}>Không - hoàn tất là mở mốc sau</option></select></div><div class="form-field"><label>Trạng thái hiện tại</label><div style="padding-top:8px">${statusBadge(r['Trạng thái mốc']||'Chưa mở')}</div></div><div class="form-field span-2"><label>Nội dung yêu cầu</label><textarea class="milestone-input" data-ms-tempid="${escapeAttr(r.__tempId)}" data-ms-field="Nội dung yêu cầu" placeholder="Điều kiện đầu ra cần đạt ở mốc này...">${escapeHtml(r['Nội dung yêu cầu']||'')}</textarea></div><div class="form-field span-2"><label>Ghi chú</label><input class="milestone-input" data-ms-tempid="${escapeAttr(r.__tempId)}" data-ms-field="Ghi chú" value="${escapeAttr(r['Ghi chú']||'')}" placeholder="Lưu ý nội bộ nếu có"></div></div></article>`).join('')}</div>`;
    openModal(`<div class="modal xwide milestone-config-modal"><div class="modal-head"><div><h2>Thiết lập mốc tiến độ</h2><p>Tạo luồng duyệt tuần tự cho công việc. Các mốc đã bắt đầu không thể xóa hoặc đổi thứ tự.</p></div><button class="modal-close" data-action="close-modal"><span class="material-symbols-rounded">close</span></button></div><div class="modal-body">${body}</div><div class="modal-footer"><button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-task-milestones"><span class="material-symbols-rounded">save</span>Lưu mốc tiến độ</button></div></div>`);
  }
  function milestoneEditorAdd(){syncMilestoneEditor();const ed=APP.state.milestoneEditor;if(!ed)return;if(ed.rows.length>=10){showToast('Giới hạn mốc','Một công việc tối đa 10 mốc để giao diện dễ theo dõi.','warning');return;}ed.rows.push(milestoneEditorBlank(ed.taskId,ed.rows.length));milestoneEditorBalance(false);renderMilestoneEditor();}
  function milestoneEditorRemove(tempId){syncMilestoneEditor();const ed=APP.state.milestoneEditor;if(!ed)return;const r=ed.rows.find(x=>x.__tempId===tempId);if(r&&r['Mã mốc']&&r['Trạng thái mốc']!=='Chưa mở'){showToast('Không thể xóa','Mốc đã bắt đầu không thể xóa.','warning');return;}ed.rows=ed.rows.filter(x=>x.__tempId!==tempId);if(!ed.rows.length)ed.rows.push(milestoneEditorBlank(ed.taskId,0));milestoneEditorBalance(false);renderMilestoneEditor();}
  function milestoneEditorMove(tempId,delta){syncMilestoneEditor();const ed=APP.state.milestoneEditor;if(!ed)return;const i=ed.rows.findIndex(x=>x.__tempId===tempId);const j=i+delta;if(i<0||j<0||j>=ed.rows.length)return;const r=ed.rows[i],other=ed.rows[j];if((r['Mã mốc']&&r['Trạng thái mốc']!=='Chưa mở')||(other['Mã mốc']&&other['Trạng thái mốc']!=='Chưa mở')){showToast('Không thể đổi thứ tự','Các mốc đã bắt đầu phải giữ nguyên thứ tự.','warning');return;}[ed.rows[i],ed.rows[j]]=[ed.rows[j],ed.rows[i]];renderMilestoneEditor();}
  function milestoneEditorBalance(render=true){const ed=APP.state.milestoneEditor;if(!ed||!ed.rows.length)return;const base=Math.floor((100/ed.rows.length)*100)/100;let used=0;ed.rows.forEach((r,i)=>{r['Trọng số (%)']=i===ed.rows.length-1?Math.round((100-used)*100)/100:base;used+=Number(r['Trọng số (%)']||0);});if(render)renderMilestoneEditor();}
  async function saveTaskMilestonesUi(){syncMilestoneEditor();const ed=APP.state.milestoneEditor;if(!ed)return;const rows=ed.rows.map(r=>{const o={};['Mã mốc','Tên mốc','Nội dung yêu cầu','Mã người phụ trách','Ngày bắt đầu','Hạn hoàn thành','Trọng số (%)','Yêu cầu duyệt','Ghi chú'].forEach(f=>o[f]=r[f]??'');return o;});if(rows.some(r=>!String(r['Tên mốc']||'').trim())){showToast('Thiếu tên mốc','Vui lòng nhập tên cho tất cả các mốc.','warning');return;}const total=rows.reduce((s,r)=>s+Number(r['Trọng số (%)']||0),0);if(Math.abs(total-100)>.1){showToast('Sai trọng số',`Tổng trọng số phải bằng 100%. Hiện tại ${round1(total)}%.`,'warning');return;}const toast=showToast('Đang lưu mốc tiến độ','Hệ thống đang cập nhật luồng mốc và tiến độ công việc.','processing',0);try{const res=await gas('saveTaskMilestones',ed.taskId,rows,APP.token,{timeout:90000});mergeDataResult(res);const taskId=ed.taskId;APP.state.milestoneEditor=null;closeModal();updateToast(toast,'Đã lưu mốc tiến độ',`${rows.length} mốc đã được thiết lập theo thứ tự.`,'success',3500);renderTaskProfile(taskId,'milestones');}catch(err){updateToast(toast,'Không thể lưu mốc',err.message,'error',6500);}}

  function openMilestoneUpdateModal(id){
    const m=(APP.data.taskMilestones||[]).find(x=>x['Mã mốc']===id);if(!m)return;
    const body=`<div class="form-section"><div class="form-section-title"><span class="material-symbols-rounded">route</span>${escapeHtml(m['Tên mốc'])}</div><p>${escapeHtml(m['Nội dung yêu cầu']||'Không có yêu cầu chi tiết.')}</p><div class="milestone-meta-row"><span>Trọng số ${round1(m['Trọng số (%)']||0)}%</span><span>${m['Yêu cầu duyệt']==='Không'?'Không cần duyệt':'Cần Quản lý duyệt'}</span></div></div><div class="form-field"><label>Tiến độ mốc (%)</label><input id="milestone-update-progress" type="number" min="0" max="100" value="${escapeAttr(m['Tiến độ mốc (%)']??0)}"><div class="field-help">Khi nhập 100%, hệ thống sẽ Gửi duyệt hoặc tự hoàn tất tùy cấu hình mốc.</div></div><div class="form-field"><label>Kết quả thực hiện</label><textarea id="milestone-update-result" placeholder="Mô tả đầu ra đã thực hiện ở mốc này...">${escapeHtml(m['Kết quả thực hiện']||'')}</textarea></div><input type="hidden" id="milestone-update-id" value="${escapeAttr(id)}">`;
    openModal(modalShell('Cập nhật mốc tiến độ',`Mốc ${m['Thứ tự mốc']} · ${m['Mã mốc']}`,body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-milestone-update"><span class="material-symbols-rounded">save</span>Cập nhật mốc</button>`,'small'));
  }
  async function saveMilestoneUpdateUi(){const id=document.getElementById('milestone-update-id')?.value;const progress=Number(document.getElementById('milestone-update-progress')?.value||0);const result=(document.getElementById('milestone-update-result')?.value||'').trim();const m=(APP.data.taskMilestones||[]).find(x=>x['Mã mốc']===id);if(progress>=100&&!result){showToast('Thiếu kết quả','Vui lòng nhập Kết quả thực hiện trước khi hoàn tất mốc.','warning');return;}const toast=showToast(progress>=100&&m?.['Yêu cầu duyệt']!=='Không'?'Đang gửi duyệt mốc':'Đang cập nhật mốc','Hệ thống đang cập nhật tiến độ và kiểm tra điều kiện mở mốc tiếp theo.','processing',0);try{const res=await gas('updateTaskMilestone',id,progress,result,APP.token,{timeout:60000});mergeDataResult(res);const taskId=res.taskId||m?.['Mã công việc'];closeModal();updateToast(toast,progress>=100?(m?.['Yêu cầu duyệt']==='Không'?'Đã hoàn tất mốc':'Đã gửi duyệt mốc'):'Đã cập nhật mốc','Tiến độ công việc đã được tính lại theo trọng số mốc.','success',3500);renderTaskProfile(taskId,'milestones');}catch(err){updateToast(toast,'Không thể cập nhật mốc',err.message,'error',5500);}}

  function openMilestoneReviewModal(id){
    const m=(APP.data.taskMilestones||[]).find(x=>x['Mã mốc']===id);if(!m)return;const t=(APP.data.tasks||[]).find(x=>x['Mã công việc']===m['Mã công việc']);
    const body=`<div class="form-section"><div class="form-section-title"><span class="material-symbols-rounded">route</span>${escapeHtml(m['Tên mốc'])}</div><p><b>Công việc:</b> ${escapeHtml(t?.['Tên công việc']||m['Mã công việc'])}</p><p><b>Người thực hiện:</b> ${escapeHtml(employeeName(m['Mã người phụ trách']))}</p><p><b>Kết quả:</b></p><p style="white-space:pre-wrap">${escapeHtml(m['Kết quả thực hiện']||'Chưa nhập kết quả.')}</p></div><div class="form-field"><label>Nhận xét của quản lý</label><textarea id="milestone-review-note" placeholder="Nếu trả lại, bắt buộc nêu rõ nội dung cần bổ sung...">${escapeHtml(m['Nhận xét quản lý']||'')}</textarea><div class="field-help">Duyệt mốc sẽ tự động mở mốc kế tiếp. Trả lại thì mốc hiện tại quay về Đang thực hiện.</div></div><input type="hidden" id="milestone-review-id" value="${escapeAttr(id)}">`;
    openModal(modalShell('Duyệt mốc tiến độ',`Mốc ${m['Thứ tự mốc']} · ${m['Mã mốc']}`,body,`<button class="btn" data-action="save-milestone-review" data-approved="false"><span class="material-symbols-rounded">undo</span>Trả lại mốc</button><button class="btn btn-success" data-action="save-milestone-review" data-approved="true"><span class="material-symbols-rounded">verified</span>Duyệt mốc</button>`,'small'));
  }
  async function saveMilestoneReviewUi(button){const id=document.getElementById('milestone-review-id')?.value;const approved=button?.dataset.approved==='true';const note=(document.getElementById('milestone-review-note')?.value||'').trim();const m=(APP.data.taskMilestones||[]).find(x=>x['Mã mốc']===id);if(!approved&&!note){showToast('Thiếu nhận xét','Vui lòng nhập lý do trước khi trả lại mốc.','warning');return;}const toast=showToast(approved?'Đang duyệt mốc':'Đang trả lại mốc','Hệ thống đang cập nhật luồng và mốc kế tiếp.','processing',0);try{const res=await gas('reviewTaskMilestone',id,approved,note,APP.token,{timeout:60000});mergeDataResult(res);const taskId=res.taskId||m?.['Mã công việc'];closeModal();updateToast(toast,approved?'Đã duyệt mốc':'Đã trả lại mốc',approved?'Mốc kế tiếp đã được mở nếu còn.':'Người thực hiện có thể tiếp tục chỉnh mốc hiện tại.','success',3500);renderTaskProfile(taskId,'milestones');}catch(err){updateToast(toast,'Không thể xử lý mốc',err.message,'error',5500);}}

  function openMilestoneReopenModal(id){const m=(APP.data.taskMilestones||[]).find(x=>x['Mã mốc']===id);if(!m)return;const body=`<div class="form-section"><div class="form-section-title"><span class="material-symbols-rounded">restart_alt</span>${escapeHtml(m['Tên mốc'])}</div><p>Mốc đã duyệt sẽ chuyển lại <b>Đang thực hiện</b>. Mốc sau phải chưa bắt đầu thì mới được mở lại.</p></div><div class="form-field"><label>Lý do mở lại <span class="required">*</span></label><textarea id="milestone-reopen-reason" placeholder="Nêu rõ nội dung cần làm lại hoặc bổ sung..."></textarea></div><input type="hidden" id="milestone-reopen-id" value="${escapeAttr(id)}">`;openModal(modalShell('Mở lại mốc tiến độ',`Mốc ${m['Thứ tự mốc']} · ${m['Mã mốc']}`,body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="save-milestone-reopen"><span class="material-symbols-rounded">restart_alt</span>Mở lại mốc</button>`,'small'));}
  async function saveMilestoneReopenUi(){const id=document.getElementById('milestone-reopen-id')?.value;const reason=(document.getElementById('milestone-reopen-reason')?.value||'').trim();const m=(APP.data.taskMilestones||[]).find(x=>x['Mã mốc']===id);if(!reason){showToast('Thiếu lý do','Vui lòng nhập lý do mở lại mốc.','warning');return;}const toast=showToast('Đang mở lại mốc','Hệ thống đang khóa lại mốc sau và cập nhật tiến độ công việc.','processing',0);try{const res=await gas('reopenTaskMilestone',id,reason,APP.token,{timeout:60000});mergeDataResult(res);const taskId=res.taskId||m?.['Mã công việc'];closeModal();updateToast(toast,'Đã mở lại mốc','Mốc đã chuyển về Đang thực hiện.','success',3200);renderTaskProfile(taskId,'milestones');}catch(err){updateToast(toast,'Không thể mở lại mốc',err.message,'error',5500);}}
})();

/* ================================================================
   WIZARD MILESTONES PATCH 1.5.1
   Cho phép cấu hình mốc tiến độ ngay khi Giao công việc.
   ================================================================ */

function wizardMilestoneTempId(){
  return 'wms_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
}
function wizardMilestoneStarted(m){
  return Boolean(m && (String(m['Trạng thái mốc']||'')!=='Chưa mở' || Number(m['Tiến độ mốc (%)']||0)>0));
}
function makeWizardMilestone(taskRow, source={}){
  return {
    __tempId: source.__tempId || wizardMilestoneTempId(),
    __errors: [],
    __fieldErrors: {},
    'Mã mốc': String(source['Mã mốc']||''),
    'Thứ tự mốc': Number(source['Thứ tự mốc']||0),
    'Tên mốc': String(source['Tên mốc']||''),
    'Nội dung yêu cầu': String(source['Nội dung yêu cầu']||''),
    'Mã người phụ trách': String(source['Mã người phụ trách']||taskRow?.['Mã người phụ trách']||''),
    'Ngày bắt đầu': toDateInput(source['Ngày bắt đầu']||taskRow?.['Ngày bắt đầu']||''),
    'Hạn hoàn thành': toDateInput(source['Hạn hoàn thành']||taskRow?.['Hạn hoàn thành']||''),
    'Trọng số (%)': source['Trọng số (%)']===''||source['Trọng số (%)']===null||source['Trọng số (%)']===undefined ? 0 : Number(source['Trọng số (%)']),
    'Yêu cầu duyệt': String(source['Yêu cầu duyệt']||'Có')==='Không'?'Không':'Có',
    'Trạng thái mốc': String(source['Trạng thái mốc']||'Chưa mở'),
    'Tiến độ mốc (%)': Number(source['Tiến độ mốc (%)']||0),
    'Kết quả thực hiện': String(source['Kết quả thực hiện']||''),
    'Mã người duyệt': String(source['Mã người duyệt']||''),
    'Ngày gửi duyệt': source['Ngày gửi duyệt']||'',
    'Ngày duyệt': source['Ngày duyệt']||'',
    'Nhận xét quản lý': String(source['Nhận xét quản lý']||''),
    'Hành động quản lý': String(source['Hành động quản lý']||''),
    'Lần duyệt': Number(source['Lần duyệt']||0),
    'Ghi chú': String(source['Ghi chú']||'')
  };
}
function blankTaskWizardRow(){
  return {
    __tempId:'tmp_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    __expanded:true,__files:[],__participants:[],__errors:[],__fieldErrors:{},
    __hasMilestones:false,__milestones:[],__originalHadMilestones:false,
    'Mã công việc':'','Tên công việc':'','Mã dự án':'','Nhóm công việc':'','Mã người phụ trách':'','Mã người giao việc':APP.session.employeeId,
    'Ngày bắt đầu':toDateInput(new Date()),'Hạn hoàn thành':toDateInput(new Date(Date.now()+7*86400000)),
    'Mức độ ưu tiên':'Bình thường','Trạng thái':'Chưa bắt đầu','Tiến độ (%)':0,'Trọng số công việc':1,
    'Kết quả':'','Mô tả':'','Ghi chú':''
  };
}
function taskToWizardRow(t){
  const parts=(APP.data.taskParticipants||[]).filter(p=>p['Mã công việc']===t['Mã công việc']).map(p=>p['Mã nhân sự']);
  const milestones=(APP.data.taskMilestones||[])
    .filter(m=>String(m['Mã công việc']||'')===String(t['Mã công việc']||''))
    .sort((a,b)=>Number(a['Thứ tự mốc']||0)-Number(b['Thứ tự mốc']||0))
    .map(m=>makeWizardMilestone(t,m));
  return {
    ...t,
    __tempId:'tmp_'+t['Mã công việc'],__expanded:true,__files:[],__participants:parts,__errors:[],__fieldErrors:{},
    __hasMilestones:milestones.length>0,__milestones:milestones,__originalHadMilestones:milestones.length>0,
    'Ngày bắt đầu':toDateInput(t['Ngày bắt đầu']),'Hạn hoàn thành':toDateInput(t['Hạn hoàn thành'])
  };
}
function updateWizardInput(el){
  const w=APP.state.wizard;if(!w)return;
  const r=w.rows.find(x=>x.__tempId===el.dataset.tempid);if(!r)return;
  const field=el.dataset.wizardField;
  const old=r[field];
  let v=el.value;if(el.type==='number')v=Number(v||0);
  r[field]=v;
  if(field==='Mã người phụ trách'){
    if(r.__participants.includes(v))r.__participants=r.__participants.filter(x=>x!==v);
    (r.__milestones||[]).forEach(m=>{if(!m['Mã người phụ trách']||String(m['Mã người phụ trách'])===String(old||''))m['Mã người phụ trách']=v;});
  }
  if(field==='Ngày bắt đầu'){
    (r.__milestones||[]).forEach(m=>{if(!m['Ngày bắt đầu']||String(m['Ngày bắt đầu'])===String(old||''))m['Ngày bắt đầu']=v;});
  }
  if(field==='Hạn hoàn thành'){
    (r.__milestones||[]).forEach(m=>{if(!m['Hạn hoàn thành']||String(m['Hạn hoàn thành'])===String(old||''))m['Hạn hoàn thành']=v;});
  }
}
function wizardDuplicateRow(id){
  const w=APP.state.wizard,r=w?.rows.find(x=>x.__tempId===id);if(!r)return;
  const copy={
    ...r,
    __tempId:'tmp_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
    __files:[...(r.__files||[])],
    __participants:[...(r.__participants||[])],
    __errors:[],__fieldErrors:{},__originalHadMilestones:false,
    __milestones:(r.__milestones||[]).map(m=>makeWizardMilestone(r,{
      ...m,'Mã mốc':'','Trạng thái mốc':'Chưa mở','Tiến độ mốc (%)':0,'Kết quả thực hiện':'',
      'Mã người duyệt':'','Ngày gửi duyệt':'','Ngày duyệt':'','Nhận xét quản lý':'','Hành động quản lý':'','Lần duyệt':0
    }))
  };
  copy['Mã công việc']='';
  w.rows.push(copy);
  renderTaskWizard();
}
function wizardRemoveEmpty(){
  const w=APP.state.wizard;if(!w)return;
  w.rows=w.rows.filter(r=>String(r['Tên công việc']||'').trim()||String(r['Mã dự án']||'').trim()||(r.__files||[]).length||(r.__hasMilestones&&(r.__milestones||[]).length));
  if(!w.rows.length)w.rows=[blankTaskWizardRow()];
  renderTaskWizard();
}

function wizardMilestoneBalance(taskRow){
  const rows=taskRow?.__milestones||[];
  if(!rows.length)return;
  const base=Math.floor((100/rows.length)*100)/100;
  let used=0;
  rows.forEach((m,i)=>{
    const weight=i===rows.length-1?Math.round((100-used)*100)/100:base;
    m['Trọng số (%)']=weight;
    used=Math.round((used+weight)*100)/100;
  });
}
function wizardMilestoneAdd(taskTempId,count=1){
  const row=APP.state.wizard?.rows.find(r=>r.__tempId===taskTempId);if(!row)return;
  row.__hasMilestones=true;
  row.__milestones=row.__milestones||[];
  const remaining=Math.max(0,10-row.__milestones.length);
  const addCount=Math.min(Math.max(1,Number(count)||1),remaining);
  if(!addCount){
    showToast('Đã đạt giới hạn','Mỗi công việc tối đa 10 mốc tiến độ.','warning',3500);return;
  }
  for(let i=0;i<addCount;i++)row.__milestones.push(makeWizardMilestone(row));
  wizardMilestoneBalance(row);
  renderTaskWizard();
}
function wizardMilestoneRemove(taskTempId,milestoneTempId){
  const row=APP.state.wizard?.rows.find(r=>r.__tempId===taskTempId);if(!row)return;
  const target=(row.__milestones||[]).find(m=>m.__tempId===milestoneTempId);
  if(wizardMilestoneStarted(target)){
    showToast('Không thể xóa mốc','Mốc đã bắt đầu xử lý nên cần giữ lại trong luồng công việc.','warning',4200);return;
  }
  row.__milestones=(row.__milestones||[]).filter(m=>m.__tempId!==milestoneTempId);
  if(row.__milestones.length)wizardMilestoneBalance(row);
  renderTaskWizard();
}
function wizardMilestoneMove(taskTempId,milestoneTempId,delta){
  const row=APP.state.wizard?.rows.find(r=>r.__tempId===taskTempId);if(!row)return;
  const rows=row.__milestones||[];
  const index=rows.findIndex(m=>m.__tempId===milestoneTempId);
  if(index<0)return;
  const target=rows[index];
  if(wizardMilestoneStarted(target)){
    showToast('Không thể đổi thứ tự','Mốc đã bắt đầu xử lý nên không thể đổi thứ tự trong Wizard.','warning',4200);return;
  }
  const next=index+Number(delta||0);
  if(next<0||next>=rows.length)return;
  if(wizardMilestoneStarted(rows[next])){
    showToast('Không thể đổi thứ tự','Không thể di chuyển qua mốc đã bắt đầu xử lý.','warning',4200);return;
  }
  [rows[index],rows[next]]=[rows[next],rows[index]];
  renderTaskWizard();
}
function wizardMilestoneToggle(taskTempId){
  const row=APP.state.wizard?.rows.find(r=>r.__tempId===taskTempId);if(!row)return;
  if(row.__hasMilestones){
    if((row.__milestones||[]).some(wizardMilestoneStarted)){
      showToast('Không thể tắt mốc tiến độ','Đã có mốc bắt đầu xử lý. Hãy quản lý mốc trong Hồ sơ công việc.','warning',4500);return;
    }
    row.__hasMilestones=false;
  }else{
    row.__hasMilestones=true;
    if(['Chờ xác nhận','Hoàn thành','Đã hủy'].includes(row['Trạng thái']))row['Trạng thái']='Chưa bắt đầu';
    if(APP.state.wizard?.mode==='create')row['Tiến độ (%)']=0;
  }
  renderTaskWizard();
}
function wizardMilestonePayload(row){
  return (row.__milestones||[]).map((m,i)=>({
    'Mã mốc':m['Mã mốc']||'',
    'Thứ tự mốc':i+1,
    'Tên mốc':String(m['Tên mốc']||'').trim(),
    'Nội dung yêu cầu':String(m['Nội dung yêu cầu']||''),
    'Mã người phụ trách':String(m['Mã người phụ trách']||row['Mã người phụ trách']||''),
    'Ngày bắt đầu':m['Ngày bắt đầu']||'',
    'Hạn hoàn thành':m['Hạn hoàn thành']||'',
    'Trọng số (%)':Number(m['Trọng số (%)']||0),
    'Yêu cầu duyệt':m['Yêu cầu duyệt']==='Không'?'Không':'Có',
    'Ghi chú':String(m['Ghi chú']||'')
  }));
}
function updateWizardMilestoneInput(el){
  const row=APP.state.wizard?.rows.find(r=>r.__tempId===el.dataset.tasktempid);if(!row)return;
  const m=(row.__milestones||[]).find(x=>x.__tempId===el.dataset.milestonetempid);if(!m)return;
  let value=el.value;
  if(el.dataset.wizardMilestoneField==='Trọng số (%)')value=Number(value||0);
  m[el.dataset.wizardMilestoneField]=value;
  if(el.dataset.wizardMilestoneField==='Trọng số (%)')refreshWizardMilestoneWeightSummary(row.__tempId);
}
function refreshWizardMilestoneWeightSummary(taskTempId){
  const row=APP.state.wizard?.rows.find(r=>r.__tempId===taskTempId);if(!row)return;
  const total=Math.round((row.__milestones||[]).reduce((s,m)=>s+Number(m['Trọng số (%)']||0),0)*100)/100;
  const el=[...document.querySelectorAll('[data-milestone-weight-summary]')].find(x=>String(x.dataset.milestoneWeightSummary||'')===String(taskTempId||''));
  if(el){
    el.textContent=`Tổng trọng số: ${total}%`;
    el.classList.toggle('invalid',Math.abs(total-100)>.05);
    el.classList.toggle('valid',Math.abs(total-100)<=.05&&(row.__milestones||[]).length>0);
  }
}
function wizardMilestonePersonOptions(selected){
  const employees=(APP.data.employees||[]).filter(e=>e['Trạng thái']!=='Đã nghỉ');
  return `<option value="">Chọn người phụ trách...</option>${employees.map(e=>`<option value="${escapeAttr(e['Mã nhân sự'])}" ${String(e['Mã nhân sự'])===String(selected||'')?'selected':''}>${escapeHtml(e['Mã nhân sự'])} - ${escapeHtml(e['Họ và tên'])}</option>`).join('')}`;
}
function renderWizardMilestoneEditor(r){
  const rows=r.__milestones||[];
  const total=Math.round(rows.reduce((s,m)=>s+Number(m['Trọng số (%)']||0),0)*100)/100;
  return `<div class="wizard-milestone-editor">
    <div class="wizard-milestone-toolbar">
      <div>
        <strong>Mốc tiến độ của công việc</strong>
        <small>Mốc sau chỉ được mở khi mốc trước hoàn tất/được duyệt.</small>
      </div>
      <div class="wizard-milestone-toolbar-actions">
        <span class="wizard-milestone-weight ${Math.abs(total-100)<=.05&&rows.length?'valid':'invalid'}" data-milestone-weight-summary="${escapeAttr(r.__tempId)}">Tổng trọng số: ${total}%</span>
        <button class="btn btn-sm" type="button" data-action="wizard-milestone-balance" data-tempid="${escapeAttr(r.__tempId)}"><span class="material-symbols-rounded">balance</span>Chia đều</button>
        <button class="btn btn-sm" type="button" data-action="wizard-milestone-add" data-count="1" data-tempid="${escapeAttr(r.__tempId)}"><span class="material-symbols-rounded">add</span>Thêm 1 mốc</button>
        <button class="btn btn-sm" type="button" data-action="wizard-milestone-add" data-count="5" data-tempid="${escapeAttr(r.__tempId)}"><span class="material-symbols-rounded">playlist_add</span>Thêm 5 mốc</button>
      </div>
    </div>
    ${rows.length?`<div class="wizard-milestone-list">${rows.map((m,i)=>renderWizardMilestoneRow(r,m,i)).join('')}</div>`:
      `<div class="wizard-milestone-empty"><span class="material-symbols-rounded">route</span><div><strong>Chưa có mốc tiến độ</strong><p>Bấm “Thêm 1 mốc” hoặc “Thêm 5 mốc” để khai báo luồng trước khi lưu công việc.</p></div></div>`}
  </div>`;
}
function renderWizardMilestoneRow(taskRow,m,i){
  const started=wizardMilestoneStarted(m);
  const status=m['Mã mốc']?String(m['Trạng thái mốc']||'Chưa mở'):'Mốc mới';
  return `<section class="wizard-milestone-row ${m.__errors?.length?'has-error':''}">
    <div class="wizard-milestone-row-head">
      <div class="wizard-milestone-number">${i+1}</div>
      <div class="wizard-milestone-title">
        <strong>${escapeHtml(m['Tên mốc']||`Mốc ${i+1}`)}</strong>
        <small>${escapeHtml(status)}${m['Lần duyệt']?` · Lần duyệt ${escapeHtml(m['Lần duyệt'])}`:''}</small>
      </div>
      <div class="wizard-milestone-row-actions">
        <button class="row-action" type="button" data-action="wizard-milestone-up" data-tempid="${escapeAttr(taskRow.__tempId)}" data-milestone="${escapeAttr(m.__tempId)}" ${i===0||started?'disabled':''} title="Đưa lên"><span class="material-symbols-rounded">arrow_upward</span></button>
        <button class="row-action" type="button" data-action="wizard-milestone-down" data-tempid="${escapeAttr(taskRow.__tempId)}" data-milestone="${escapeAttr(m.__tempId)}" ${i===taskRow.__milestones.length-1||started?'disabled':''} title="Đưa xuống"><span class="material-symbols-rounded">arrow_downward</span></button>
        <button class="row-action danger" type="button" data-action="wizard-milestone-remove" data-tempid="${escapeAttr(taskRow.__tempId)}" data-milestone="${escapeAttr(m.__tempId)}" ${started?'disabled':''} title="${started?'Mốc đã bắt đầu, không thể xóa':'Xóa mốc'}"><span class="material-symbols-rounded">delete</span></button>
      </div>
    </div>
    <div class="wizard-milestone-fields">
      <label class="wizard-milestone-field span-2"><span>Tên mốc <b>*</b></span><input class="${m.__fieldErrors?.['Tên mốc']?'invalid':''}" data-wizard-milestone-field="Tên mốc" data-tasktempid="${escapeAttr(taskRow.__tempId)}" data-milestonetempid="${escapeAttr(m.__tempId)}" value="${escapeAttr(m['Tên mốc']||'')}" placeholder="Ví dụ: Lập kế hoạch, Trình duyệt..."></label>
      <label class="wizard-milestone-field span-2"><span>Người phụ trách <b>*</b></span><select class="${m.__fieldErrors?.['Mã người phụ trách']?'invalid':''}" data-wizard-milestone-field="Mã người phụ trách" data-tasktempid="${escapeAttr(taskRow.__tempId)}" data-milestonetempid="${escapeAttr(m.__tempId)}">${wizardMilestonePersonOptions(m['Mã người phụ trách'])}</select></label>
      <label class="wizard-milestone-field"><span>Ngày bắt đầu <b>*</b></span><input class="${m.__fieldErrors?.['Ngày bắt đầu']?'invalid':''}" type="date" data-wizard-milestone-field="Ngày bắt đầu" data-tasktempid="${escapeAttr(taskRow.__tempId)}" data-milestonetempid="${escapeAttr(m.__tempId)}" value="${escapeAttr(m['Ngày bắt đầu']||'')}"></label>
      <label class="wizard-milestone-field"><span>Hạn hoàn thành <b>*</b></span><input class="${m.__fieldErrors?.['Hạn hoàn thành']?'invalid':''}" type="date" data-wizard-milestone-field="Hạn hoàn thành" data-tasktempid="${escapeAttr(taskRow.__tempId)}" data-milestonetempid="${escapeAttr(m.__tempId)}" value="${escapeAttr(m['Hạn hoàn thành']||'')}"></label>
      <label class="wizard-milestone-field"><span>Trọng số (%) <b>*</b></span><input class="${m.__fieldErrors?.['Trọng số (%)']?'invalid':''}" type="number" min="0.01" max="100" step="0.01" data-wizard-milestone-field="Trọng số (%)" data-tasktempid="${escapeAttr(taskRow.__tempId)}" data-milestonetempid="${escapeAttr(m.__tempId)}" value="${escapeAttr(m['Trọng số (%)']??0)}"></label>
      <label class="wizard-milestone-field"><span>Yêu cầu quản lý duyệt</span><select data-wizard-milestone-field="Yêu cầu duyệt" data-tasktempid="${escapeAttr(taskRow.__tempId)}" data-milestonetempid="${escapeAttr(m.__tempId)}"><option value="Có" ${m['Yêu cầu duyệt']!=='Không'?'selected':''}>Có</option><option value="Không" ${m['Yêu cầu duyệt']==='Không'?'selected':''}>Không</option></select></label>
      <label class="wizard-milestone-field span-4"><span>Nội dung/Yêu cầu của mốc</span><textarea data-wizard-milestone-field="Nội dung yêu cầu" data-tasktempid="${escapeAttr(taskRow.__tempId)}" data-milestonetempid="${escapeAttr(m.__tempId)}" placeholder="Nêu rõ đầu ra cần đạt để quản lý kiểm tra...">${escapeHtml(m['Nội dung yêu cầu']||'')}</textarea></label>
    </div>
    ${m.__errors?.length?`<div class="wizard-milestone-errors">${m.__errors.map(x=>escapeHtml(x)).join('<br>')}</div>`:''}
  </section>`;
}
function renderTaskWizardRow(r,i){
  const invalid=r.__errors?.length;
  const progressControl=r.__hasMilestones
    ? `<input type="number" min="0" max="100" value="${escapeAttr(r['Tiến độ (%)']??0)}" readonly disabled title="Tiến độ được tự động tính theo mốc">`
    : `<input type="number" min="0" max="100" data-wizard-field="Tiến độ (%)" data-tempid="${r.__tempId}" value="${escapeAttr(r['Tiến độ (%)']??0)}">`;
  return `<tr>
    <td><div style="display:flex;align-items:center;gap:6px"><span class="row-status ${invalid?'invalid':''}"></span><strong>${i+1}</strong></div></td>
    <td><input class="${fieldHasError(r,'Tên công việc')?'invalid':''}" data-wizard-field="Tên công việc" data-tempid="${r.__tempId}" value="${escapeAttr(r['Tên công việc'])}" placeholder="Nhập tên công việc"></td>
    <td>${wizardCombo(r,'Mã dự án',projectOptions(),'Tìm dự án...')}</td>
    <td>${wizardCombo(r,'Nhóm công việc',categoryOptions('Nhóm công việc'),'Tìm nhóm...')}</td>
    <td>${wizardCombo(r,'Mã người phụ trách',personOptions(),'Tìm nhân sự...')}</td>
    <td><input type="date" data-wizard-field="Hạn hoàn thành" data-tempid="${r.__tempId}" value="${escapeAttr(r['Hạn hoàn thành'])}"></td>
    <td>${wizardCombo(r,'Mức độ ưu tiên',fixedOptions('priority'),'Chọn ưu tiên')}</td>
    <td>${progressControl}</td>
    <td><button class="btn btn-sm file-input-inline" data-action="wizard-file-trigger" data-tempid="${r.__tempId}"><span class="material-symbols-rounded">attach_file</span>${r.__files.length?r.__files.length+' file':'Chọn file'}</button><input class="hidden" type="file" multiple data-wizard-file="${r.__tempId}"></td>
    <td><div class="row-actions"><button class="row-action" data-action="wizard-toggle-row" data-tempid="${r.__tempId}" title="Mở rộng"><span class="material-symbols-rounded">${r.__expanded?'expand_less':'expand_more'}</span></button>${APP.state.wizard.mode==='create'?`<button class="row-action" data-action="wizard-duplicate-row" data-tempid="${r.__tempId}" title="Nhân bản"><span class="material-symbols-rounded">content_copy</span></button><button class="row-action danger" data-action="wizard-remove-row" data-tempid="${r.__tempId}" title="Xóa dòng"><span class="material-symbols-rounded">delete</span></button>`:''}</div></td>
  </tr>
  ${r.__expanded?`<tr><td colspan="10" style="background:var(--surface-2);padding:10px">
    <div class="form-grid cols-3">
      <div class="form-field"><label>Ngày bắt đầu ${tooltipIcon(getFieldTooltip('tasks','Ngày bắt đầu'))}</label><input type="date" data-wizard-field="Ngày bắt đầu" data-tempid="${r.__tempId}" value="${escapeAttr(r['Ngày bắt đầu'])}"><div class="field-help">Ngày bắt đầu thực hiện.</div></div>
      <div class="form-field"><label>Trạng thái ${tooltipIcon(getFieldTooltip('tasks','Trạng thái'))}</label>${wizardCombo(r,'Trạng thái',fixedOptions('taskStatus'),'Chọn trạng thái')}</div>
      <div class="form-field"><label>Trọng số công việc ${tooltipIcon(getFieldTooltip('tasks','Trọng số công việc'))}</label><input type="number" min="0.1" max="10" step="0.1" data-wizard-field="Trọng số công việc" data-tempid="${r.__tempId}" value="${escapeAttr(r['Trọng số công việc']??1)}"><div class="field-help">Mặc định 1; việc nặng hơn có thể tăng hệ số.</div></div>
      <div class="form-field"><label>Người tham gia</label>${multiPersonPicker('wizard-part-'+r.__tempId,r.__participants,'Chọn người phối hợp. KPI chính không tính toàn bộ cho người tham gia.')}</div>
      <div class="form-field full wizard-milestone-toggle-card">
        <div class="wizard-milestone-toggle-copy"><div class="wizard-milestone-toggle-icon"><span class="material-symbols-rounded">route</span></div><div><strong>Công việc có mốc tiến độ</strong><small>Bật khi công việc phải hoàn thành từng mốc theo thứ tự. Có thể yêu cầu quản lý duyệt từng mốc trước khi làm tiếp.</small></div></div>
        <button type="button" class="wizard-milestone-switch ${r.__hasMilestones?'on':''}" data-action="wizard-milestone-toggle" data-tempid="${escapeAttr(r.__tempId)}" aria-pressed="${r.__hasMilestones?'true':'false'}"><span class="switch-track"><i></i></span><b>${r.__hasMilestones?'Đang bật':'Đang tắt'}</b></button>
      </div>
      ${r.__hasMilestones?`<div class="form-field full">${renderWizardMilestoneEditor(r)}</div>`:''}
      <div class="form-field full"><label>Mô tả ${tooltipIcon(getFieldTooltip('tasks','Mô tả'))}</label><textarea data-wizard-field="Mô tả" data-tempid="${r.__tempId}" placeholder="Mô tả yêu cầu công việc...">${escapeHtml(r['Mô tả']||'')}</textarea></div>
      <div class="form-field full"><label>Kết quả ${tooltipIcon(getFieldTooltip('tasks','Kết quả'))}</label><textarea data-wizard-field="Kết quả" data-tempid="${r.__tempId}" placeholder="Nhập kết quả hoặc để trống khi chưa hoàn thành...">${escapeHtml(r['Kết quả']||'')}</textarea></div>
      <div class="form-field full"><label>File đã chọn</label><div class="pending-files">${r.__files.length?r.__files.map((f,fi)=>`<div class="file-chip"><div class="file-chip-icon"><span class="material-symbols-rounded">${fileIcon(f.type)}</span></div><div><strong>${escapeHtml(f.name)}</strong><small>${formatFileSize(f.size)}</small></div><div class="file-chip-actions"><button class="row-action danger" data-action="wizard-remove-file" data-tempid="${r.__tempId}" data-fileindex="${fi}"><span class="material-symbols-rounded">close</span></button></div></div>`).join(''):'<span class="muted">Chưa chọn file.</span>'}</div></div>
    </div>
    ${r.__errors?.length?`<div class="wizard-error-summary" style="margin-top:8px">${r.__errors.map(x=>escapeHtml(x)).join('<br>')}</div>`:''}
  </td></tr>`:''}`;
}
function validateWizardRows(){
  const w=APP.state.wizard;let total=0;const seen=new Set();
  w.rows.forEach((r,i)=>{
    r.__errors=[];r.__fieldErrors={};
    const req=['Tên công việc','Mã dự án','Nhóm công việc','Mã người phụ trách','Ngày bắt đầu','Hạn hoàn thành','Mức độ ưu tiên','Trạng thái'];
    req.forEach(f=>{if(r[f]===''||r[f]===null||r[f]===undefined){r.__errors.push(`Thiếu ${f}`);r.__fieldErrors[f]=true;}});
    const start=parseDate(r['Ngày bắt đầu']),due=parseDate(r['Hạn hoàn thành']);
    if(start&&due&&due<start){r.__errors.push('Hạn hoàn thành phải từ ngày bắt đầu trở đi.');r.__fieldErrors['Hạn hoàn thành']=true;}
    const key=normalizeText(r['Tên công việc'])+'|'+r['Mã dự án']+'|'+r['Mã người phụ trách']+'|'+r['Hạn hoàn thành'];
    if(seen.has(key))r.__errors.push('Dòng có khả năng bị trùng với một dòng khác trong biểu mẫu.');
    seen.add(key);
    const taskWeight=Number(r['Trọng số công việc']??1);
    if(!Number.isFinite(taskWeight)||taskWeight<=0||taskWeight>10){r.__errors.push('Trọng số công việc phải lớn hơn 0 và không vượt quá 10.');r.__fieldErrors['Trọng số công việc']=true;}
    if(APP.session.role==='Nhóm'&&r['Trạng thái']==='Hoàn thành')r.__errors.push('Nhóm không thể tự đặt trạng thái Hoàn thành.');

    if(r.__hasMilestones){
      const milestones=r.__milestones||[];
      if(!milestones.length)r.__errors.push('Đã bật mốc tiến độ nhưng chưa khai báo mốc nào.');
      if(milestones.length>10)r.__errors.push('Mỗi công việc tối đa 10 mốc tiến độ.');
      if(['Chờ xác nhận','Hoàn thành','Đã hủy'].includes(r['Trạng thái']))r.__errors.push('Công việc có mốc tiến độ chưa thể bắt đầu ở trạng thái '+r['Trạng thái']+'.');
      let weightTotal=0;
      milestones.forEach((m,mi)=>{
        m.__errors=[];m.__fieldErrors={};
        const prefix=`Mốc ${mi+1}`;
        if(!String(m['Tên mốc']||'').trim()){m.__errors.push(`${prefix}: thiếu Tên mốc.`);m.__fieldErrors['Tên mốc']=true;}
        if(!String(m['Mã người phụ trách']||'').trim()){m.__errors.push(`${prefix}: thiếu Người phụ trách.`);m.__fieldErrors['Mã người phụ trách']=true;}
        if(!m['Ngày bắt đầu']){m.__errors.push(`${prefix}: thiếu Ngày bắt đầu.`);m.__fieldErrors['Ngày bắt đầu']=true;}
        if(!m['Hạn hoàn thành']){m.__errors.push(`${prefix}: thiếu Hạn hoàn thành.`);m.__fieldErrors['Hạn hoàn thành']=true;}
        const ms=parseDate(m['Ngày bắt đầu']),md=parseDate(m['Hạn hoàn thành']);
        if(ms&&md&&md<ms){m.__errors.push(`${prefix}: Hạn hoàn thành phải từ Ngày bắt đầu trở đi.`);m.__fieldErrors['Hạn hoàn thành']=true;}
        if(start&&ms&&ms<start){m.__errors.push(`${prefix}: Ngày bắt đầu không được trước ngày bắt đầu công việc.`);m.__fieldErrors['Ngày bắt đầu']=true;}
        if(due&&md&&md>due){m.__errors.push(`${prefix}: Hạn mốc không được sau hạn công việc.`);m.__fieldErrors['Hạn hoàn thành']=true;}
        const mw=Number(m['Trọng số (%)']);
        if(!Number.isFinite(mw)||mw<=0||mw>100){m.__errors.push(`${prefix}: Trọng số phải lớn hơn 0 và không vượt quá 100%.`);m.__fieldErrors['Trọng số (%)']=true;}
        weightTotal+=Number.isFinite(mw)?mw:0;
        r.__errors.push(...m.__errors);
      });
      weightTotal=Math.round(weightTotal*100)/100;
      if(milestones.length&&Math.abs(weightTotal-100)>.05)r.__errors.push(`Tổng trọng số các mốc phải bằng 100%. Hiện tại: ${weightTotal}%.`);
    }
    total+=r.__errors.length;
  });
  return total;
}
function renderTaskWizardReview(){
  const w=APP.state.wizard;validateWizardRows();
  const milestoneCount=w.rows.reduce((s,r)=>s+(r.__hasMilestones?(r.__milestones||[]).length:0),0);
  return `<div class="section-title-row"><div><h2>Kiểm tra thông tin trước khi lưu</h2><small>${w.rows.length} bản ghi · ${milestoneCount} mốc tiến độ · ${w.rows.reduce((s,r)=>s+r.__files.length,0)} file đính kèm</small></div><span class="badge ${w.rows.some(r=>r.__errors.length)?'badge-red':'badge-green'}">${w.rows.some(r=>r.__errors.length)?'Cần sửa':'Dữ liệu hợp lệ'}</span></div>
  <div class="wizard-review">${w.rows.map((r,i)=>{
    const mcount=r.__hasMilestones?(r.__milestones||[]).length:0;
    const weight=r.__hasMilestones?Math.round((r.__milestones||[]).reduce((s,m)=>s+Number(m['Trọng số (%)']||0),0)*100)/100:0;
    return `<div class="review-row"><div class="row-status ${r.__errors.length?'invalid':'valid'}"></div><div><strong>${i+1}. ${escapeHtml(r['Tên công việc']||'Chưa nhập tên')}</strong><p>${escapeHtml(projectName(r['Mã dự án']))} · ${escapeHtml(employeeName(r['Mã người phụ trách']))} · Hạn ${formatDate(r['Hạn hoàn thành'])} · ${r.__participants.length} người tham gia · ${r.__files.length} file${r.__hasMilestones?` · ${mcount} mốc (${weight}%)`:''}</p>${r.__hasMilestones&&mcount?`<div class="review-milestones">${r.__milestones.map((m,mi)=>`<span><b>${mi+1}</b>${escapeHtml(m['Tên mốc']||'Chưa đặt tên')} · ${escapeHtml(employeeName(m['Mã người phụ trách'])||m['Mã người phụ trách']||'-')} · ${Number(m['Trọng số (%)']||0)}% · ${escapeHtml(m['Yêu cầu duyệt']==='Không'?'Không cần duyệt':'Cần duyệt')}</span>`).join('')}</div>`:''}${r.__errors.length?`<div class="wizard-error-summary" style="margin-top:7px">${r.__errors.map(e=>escapeHtml(e)).join('<br>')}</div>`:''}</div><div>${r.__errors.length?statusBadge('Cần bổ sung'):statusBadge('Hợp lệ')}</div></div>`;
  }).join('')}</div>`;
}
async function saveWizardMilestonesForTask(row,taskId){
  if(row.__hasMilestones){
    const res=await gas('saveTaskMilestones',taskId,wizardMilestonePayload(row),APP.token,{timeout:60000});
    mergeDataResult(res);
    return res;
  }
  if(row.__originalHadMilestones){
    const res=await gas('saveTaskMilestones',taskId,[],APP.token,{timeout:60000});
    mergeDataResult(res);
    return res;
  }
  return null;
}
async function saveTaskWizard(){
  const w=APP.state.wizard;
  if(!w)return;
  syncWizardParticipants();
  if(validateWizardRows()){
    w.step=1;renderTaskWizard();
    showToast('Chưa thể lưu','Vui lòng sửa các dòng lỗi, đặc biệt tổng trọng số mốc phải bằng 100%.','error',5200);
    return;
  }

  const fileRows=w.rows.map(r=>r.__files||[]);
  const mode=w.mode;
  closeModal();

  const toast=showToast('Đang lưu công việc','Đang lưu công việc, người tham gia, mốc tiến độ và tài liệu.','processing',0);
  let primarySaved=false;
  let savedIds=[];

  try{
    if(mode==='edit'){
      const r=w.rows[0];
      const clean=stripWizardRow(r);
      const res=await gas('saveRecord','tasks',clean,APP.token,{timeout:45000});
      mergeDataResult(res);
      const id=res.id||clean['Mã công việc'];
      savedIds=[id];primarySaved=true;
      renderCurrentPage();

      if(APP.permissions.canManageTasks){
        const pr=await gas('saveTaskParticipants',id,r.__participants.map(employeeId=>({
          employeeId,role:'Phối hợp',joinDate:r['Ngày bắt đầu'],
          status:r['Trạng thái']==='Hoàn thành'?'Đã kết thúc':'Đang tham gia'
        })),APP.token,{timeout:45000});
        mergeDataResult(pr);
      }
      await saveWizardMilestonesForTask(r,id);
      for(const f of (fileRows[0]||[]))await uploadOneFile(f,'Công việc',id);
    }else{
      const hasFiles=fileRows.some(x=>x.length);
      if(!hasFiles){
        const res=await gas('bulkAddRecords','tasks',w.rows.map(stripWizardRow),APP.token,{timeout:60000});
        if(res.success===false)throw new Error(res.errors?.map(x=>`Dòng ${x.row}: ${x.errors.join(', ')}`).join('; ')||'Có dòng dữ liệu không hợp lệ.');
        mergeDataResult(res);
        savedIds=res.ids||[];primarySaved=true;
        renderCurrentPage();

        for(let i=0;i<savedIds.length;i++){
          const r=w.rows[i],id=savedIds[i];
          if(r.__participants.length){
            const pr=await gas('saveTaskParticipants',id,r.__participants.map(employeeId=>({
              employeeId,role:'Phối hợp',joinDate:r['Ngày bắt đầu'],status:'Đang tham gia'
            })),APP.token,{timeout:45000});
            mergeDataResult(pr);
          }
          await saveWizardMilestonesForTask(r,id);
        }
      }else{
        for(let i=0;i<w.rows.length;i++){
          const r=w.rows[i];
          const res=await gas('saveRecord','tasks',stripWizardRow(r),APP.token,{timeout:45000});
          mergeDataResult(res);
          const id=res.id;savedIds.push(id);primarySaved=true;
          renderCurrentPage();

          if(r.__participants.length){
            const pr=await gas('saveTaskParticipants',id,r.__participants.map(employeeId=>({
              employeeId,role:'Phối hợp',joinDate:r['Ngày bắt đầu'],status:'Đang tham gia'
            })),APP.token,{timeout:45000});
            mergeDataResult(pr);
          }
          await saveWizardMilestonesForTask(r,id);
          for(const f of (fileRows[i]||[]))await uploadOneFile(f,'Công việc',id);
        }
      }
    }

    renderCurrentPage();
    const milestoneTasks=w.rows.filter(r=>r.__hasMilestones).length;
    updateToast(toast,'Đã lưu công việc',`${savedIds.length||1} công việc đã được cập nhật${milestoneTasks?` · ${milestoneTasks} công việc có mốc tiến độ`:''}.`,'success',4200);
  }catch(err){
    if(primarySaved){
      renderCurrentPage();
      updateToast(toast,'Công việc đã được lưu',`Bản ghi chính đã có trên hệ thống, nhưng một phần dữ liệu phụ/mốc tiến độ chưa đồng bộ xong: ${err.message}`,'warning',7500);
    }else{
      updateToast(toast,'Không thể lưu công việc',err.message,'error',6500);
    }
  }
}

const WIZARD_MILESTONE_BASE_ROUTE_ACTION=routeAction;
routeAction=async function(action,el,e){
  if(action==='wizard-milestone-toggle')return wizardMilestoneToggle(el.dataset.tempid||'');
  if(action==='wizard-milestone-add')return wizardMilestoneAdd(el.dataset.tempid||'',Number(el.dataset.count||1));
  if(action==='wizard-milestone-remove')return wizardMilestoneRemove(el.dataset.tempid||'',el.dataset.milestone||'');
  if(action==='wizard-milestone-up')return wizardMilestoneMove(el.dataset.tempid||'',el.dataset.milestone||'',-1);
  if(action==='wizard-milestone-down')return wizardMilestoneMove(el.dataset.tempid||'',el.dataset.milestone||'',1);
  if(action==='wizard-milestone-balance'){
    const row=APP.state.wizard?.rows.find(r=>r.__tempId===el.dataset.tempid);
    if(row){wizardMilestoneBalance(row);renderTaskWizard();}
    return;
  }
  return WIZARD_MILESTONE_BASE_ROUTE_ACTION(action,el,e);
};

document.addEventListener('input',function(e){
  const el=e.target.closest('[data-wizard-milestone-field]');
  if(el)updateWizardMilestoneInput(el);
},true);
document.addEventListener('change',function(e){
  const el=e.target.closest('[data-wizard-milestone-field]');
  if(el)updateWizardMilestoneInput(el);
},true);





/* ===================== PATCH 1.5.3 - MILESTONE TOGGLE IN ACTIVE TASK CARD ===================== */
(function(){
  // renderTaskWizardEntry is global, but smartTaskRowCard lives inside UX PATCH 5's closure.
  // Therefore patching smartTaskRowCard from global scope does nothing. Patch the rendered HTML instead.
  if(typeof renderTaskWizardEntry!=='function') return;
  const BASE_RENDER_TASK_WIZARD_ENTRY_153 = renderTaskWizardEntry;

  function wizardMilestoneToggleBlock153(r){
    const count=(r.__milestones||[]).length;
    const total=Math.round((r.__milestones||[]).reduce((sum,m)=>sum+Number(m['Trọng số (%)']||0),0)*100)/100;
    const summary=r.__hasMilestones
      ? `<span class="wizard-milestone-inline-summary">${count} mốc${count?` · ${total}%`:''}</span>`
      : `<span class="wizard-milestone-inline-summary muted">Không bắt buộc</span>`;
    return `<section class="wizard-milestone-inline-section">
      <div class="wizard-milestone-toggle-card">
        <div class="wizard-milestone-toggle-copy">
          <div class="wizard-milestone-toggle-icon"><span class="material-symbols-rounded">route</span></div>
          <div><strong>Công việc có mốc tiến độ</strong><small>Bật khi công việc phải hoàn thành từng mốc theo thứ tự. Có thể yêu cầu Quản lý duyệt từng mốc trước khi làm tiếp.</small></div>
        </div>
        <div class="wizard-milestone-toggle-side">${summary}<button type="button" class="wizard-milestone-switch ${r.__hasMilestones?'on':''}" data-action="wizard-milestone-toggle" data-tempid="${escapeAttr(r.__tempId)}" aria-pressed="${r.__hasMilestones?'true':'false'}"><span class="switch-track"><i></i></span><b>${r.__hasMilestones?'Đang bật':'Đang tắt'}</b></button></div>
      </div>
      ${r.__hasMilestones?`<div class="wizard-milestone-inline-editor">${renderWizardMilestoneEditor(r)}</div>`:''}
    </section>`;
  }

  function lockMilestoneProgress153(segment,r){
    if(!r?.__hasMilestones) return segment;
    const progressPattern=/<div class="flow-stepper"><button type="button" class="stepper-btn" data-stepper="minus" data-target-tempid="[^"]+" data-target-field="Tiến độ \(%\)">−<\/button><input type="number" min="0" max="100" data-wizard-field="Tiến độ \(%\)" data-tempid="[^"]+" value="[^"]*"><button type="button" class="stepper-btn" data-stepper="plus" data-target-tempid="[^"]+" data-target-field="Tiến độ \(%\)">\+<\/button><\/div>/;
    const locked=`<div class="flow-stepper milestone-progress-locked"><input type="number" min="0" max="100" value="${escapeAttr(r['Tiến độ (%)']??0)}" readonly disabled title="Tiến độ được tự động tính theo mốc"><span class="milestone-progress-lock-note">Tự tính theo mốc</span></div>`;
    return segment.replace(progressPattern,locked);
  }

  renderTaskWizardEntry = function(){
    let html=BASE_RENDER_TASK_WIZARD_ENTRY_153();
    const rows=APP.state.wizard?.rows||[];
    const cardPrefix='<article class="smart-record-card flow-task-card';
    const parts=html.split(cardPrefix);
    if(parts.length<=1) return html;

    let rebuilt=parts[0];
    for(let i=1;i<parts.length;i++){
      let segment=cardPrefix+parts[i];
      const r=rows[i-1];
      if(r && r.__expanded){
        const marker='<div class="flow-split-grid">';
        if(segment.includes(marker)) segment=segment.replace(marker,wizardMilestoneToggleBlock153(r)+marker);
        segment=lockMilestoneProgress153(segment,r);
      }
      rebuilt+=segment;
    }
    return rebuilt;
  };
})();

/* ========================= MODULE ĐIỂM DANH ========================= */
function ensureAttendanceUiStyles(){
  if(document.getElementById('attendance-ui-styles'))return;
  const style=document.createElement('style');style.id='attendance-ui-styles';
  style.textContent=`
  .attendance-kpis{display:grid;grid-template-columns:repeat(4,minmax(130px,1fr));gap:12px;margin:14px 0}
  .attendance-kpi{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:15px}
  .attendance-kpi strong{display:block;font-size:24px;margin-top:5px}
  .attendance-grid{display:grid;grid-template-columns:minmax(300px,.85fr) minmax(0,1.5fr);gap:14px;align-items:start}
  .attendance-session{border:1px solid var(--line);border-radius:13px;padding:14px;margin:9px 0;background:var(--panel)}
  .attendance-session.active{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary) inset}
  .attendance-session-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
  .attendance-session h3{font-size:15px;margin:0 0 5px}
  .attendance-meta{font-size:12px;color:var(--muted);line-height:1.7}
  .attendance-table-wrap{overflow:auto}
  .attendance-table{width:100%;border-collapse:collapse;min-width:650px}
  .attendance-table th,.attendance-table td{padding:10px;border-bottom:1px solid var(--line);text-align:left;font-size:12px;white-space:nowrap}
  .attendance-table th{color:var(--muted);font-weight:700;background:var(--surface)}
  .attendance-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .attendance-form-grid .field.full{grid-column:1/-1}
  .attendance-form-grid .field{min-width:0;display:flex;flex-direction:column;gap:6px}
  .attendance-form-grid .field label{font-size:12px;font-weight:650;color:var(--text)}
  .attendance-form-grid .form-control{width:100%;min-width:0;min-height:42px;border:1px solid var(--line);border-radius:10px;padding:9px 11px;background:var(--panel);color:var(--text);font:inherit;box-sizing:border-box}
  .attendance-form-grid textarea.form-control{display:block;width:100%;min-width:0;min-height:110px;height:auto;line-height:1.5;resize:vertical;white-space:pre-wrap;overflow-wrap:anywhere}
  .attendance-setup-section .attendance-form-grid{width:100%;min-width:0;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .attendance-setup-section .attendance-form-grid .field{width:100%;min-width:0;align-items:stretch}
  .attendance-setup-section .attendance-form-grid .field.full{grid-column:1/-1}
  .attendance-setup-section .attendance-form-grid .field label{display:block;width:100%;line-height:1.45;white-space:normal;overflow-wrap:anywhere}
  .attendance-setup-section .attendance-form-grid .form-control{display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box;line-height:1.45}
  .attendance-setup-section .attendance-note-textarea{min-height:112px;padding:12px 13px;font-size:13px}
  .attendance-setup-section .attendance-note-textarea::placeholder{white-space:normal;opacity:.75}
  .attendance-datetime{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(112px,.8fr);gap:8px}
  .attendance-schedule-toggle{display:flex;align-items:flex-start;gap:10px;padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--surface)}
  .attendance-schedule-toggle input{margin-top:3px;accent-color:var(--primary)}
  .attendance-schedule-toggle strong{display:block;font-size:13px;color:var(--text)}
  .attendance-schedule-toggle small{display:block;color:var(--muted);font-size:11px;line-height:1.55;margin-top:3px}
  .attendance-form-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .attendance-status{display:inline-flex;border-radius:99px;padding:4px 9px;font-size:11px;font-weight:700;background:var(--surface);color:var(--muted)}
  .attendance-status.open{color:#15803d;background:#dcfce7}.attendance-status.closed{color:#64748b;background:#e2e8f0}
  .attendance-status.present{color:#15803d;background:#dcfce7}.attendance-status.absent{color:#b91c1c;background:#fee2e2}
  .attendance-empty{padding:22px;text-align:center;color:var(--muted)}
  .attendance-status-select{min-width:130px;display:inline-block;width:auto;margin-right:6px;padding:6px 8px;font-size:12px}
  @media(max-width:900px){.attendance-grid{grid-template-columns:1fr}.attendance-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:560px){.attendance-form-grid{grid-template-columns:1fr}.attendance-form-grid .field.full{grid-column:auto}.attendance-datetime{grid-template-columns:minmax(0,1.2fr) minmax(105px,.8fr)}.attendance-kpis{gap:8px}.attendance-kpi{padding:11px}.attendance-kpi strong{font-size:20px}}
   .attendance-people-picker{border:1px solid var(--border,#dbe4f0);border-radius:14px;background:var(--surface,#fff);overflow:hidden}
 .attendance-people-heading{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;color:var(--text)}
 .attendance-people-search{display:flex;align-items:center;gap:10px;margin:0 10px 10px;padding:0 12px;border:1px solid var(--border,#dbe4f0);border-radius:12px;background:var(--panel,#fff);min-height:42px}
 .attendance-people-search .material-symbols-rounded{color:var(--muted);font-size:19px}
 .attendance-people-search input{width:100%;min-width:0;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;padding:9px 0!important;font:inherit}
 .attendance-people-all{display:flex;align-items:center;gap:10px;padding:11px 13px;border-top:1px solid var(--border,#e2e8f0);border-bottom:1px solid var(--border,#e2e8f0);background:var(--surface-2,#f8fafc);cursor:pointer}
 .attendance-people-all input,.attendance-person-check{appearance:auto!important;opacity:1!important;position:static!important;visibility:visible!important;display:inline-block!important;width:16px!important;height:16px!important;min-width:16px!important;margin:0!important;accent-color:var(--primary,#16a34a);cursor:pointer}
 .attendance-people-all span,.attendance-person-name{display:flex;flex-direction:column;gap:2px;min-width:0}
 .attendance-people-all strong,.attendance-person-name strong{font-size:12px;color:var(--text)}
 .attendance-people-all small,.attendance-person-name small{font-size:11px;color:var(--muted)}
 .attendance-people-list{max-height:220px;overflow-y:auto;overflow-x:hidden}
 .attendance-person-row{display:flex;align-items:center;gap:10px;padding:9px 12px;min-height:42px;border-bottom:1px solid var(--line,rgba(148,163,184,.12));cursor:pointer}
 .attendance-person-row:hover{background:var(--surface-2,#f8fafc)}
 .attendance-person-avatar{width:27px;height:27px;flex:0 0 27px;border-radius:50%;display:grid;place-items:center;background:var(--surface-2,#eaf2ff);color:var(--primary,#2563eb);font-size:9px;font-weight:700}
 .attendance-person-name{flex:1}
 .attendance-person-id{font-size:10px;color:var(--muted);white-space:nowrap}

/* Đồng bộ giao diện nhật ký và danh sách thành viên với phân hệ Nhân sự */
.attendance-people-picker{border:1px solid var(--border,#dbe4f0);border-radius:15px;background:var(--panel,#fff);box-shadow:0 2px 8px rgba(15,23,42,.035)}
.attendance-people-heading{padding:13px 15px}
.attendance-people-search{margin:0 12px 12px;border-radius:12px;background:#fff}
.attendance-people-all{padding:12px 15px;background:#f7f9fc}
.attendance-people-list{max-height:300px;overscroll-behavior:contain}
.attendance-person-row{display:grid;grid-template-columns:18px 40px minmax(0,1fr) auto;gap:11px;padding:10px 14px;min-height:62px;align-items:center;background:#fff}
.attendance-person-row:last-child{border-bottom:0}
.attendance-person-row:has(.attendance-person-check:checked){background:#f0fdf4}
.attendance-person-avatar{width:40px;height:40px;flex:0 0 40px;border-radius:50%;overflow:hidden;background:#e8f1ff;color:#315fbd;font-size:12px}
.attendance-person-avatar .avatar{width:100%!important;height:100%!important;display:flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden}
.attendance-person-avatar img{display:block;width:100%;height:100%;object-fit:cover}
.attendance-person-name strong{font-size:12px;font-weight:700;line-height:1.4}
.attendance-person-name small{font-size:10.5px}
.attendance-person-id{font-size:10.5px;font-weight:600;color:#64748b}
.attendance-table-wrap{border:1px solid var(--border,#e2e8f0);border-radius:13px;background:var(--panel,#fff);overflow:auto}
.attendance-table{min-width:900px;border-collapse:separate;border-spacing:0}
.attendance-table th{position:sticky;top:0;z-index:1;background:#f7f9fc;color:#64748b;font-size:11px;letter-spacing:.01em;padding:13px 12px;border-bottom:1px solid #e2e8f0}
.attendance-table td{padding:11px 12px;border-bottom:1px solid #edf1f6;font-size:12px;vertical-align:middle;white-space:normal}
.attendance-table tbody tr:last-child td{border-bottom:0}
.attendance-table tbody tr:hover{background:#fafcff}
.attendance-employee-cell{display:flex;align-items:center;gap:10px;min-width:175px}
.attendance-employee-cell .avatar{width:36px!important;height:36px!important;flex:0 0 36px;border-radius:50%;overflow:hidden}
.attendance-employee-cell .avatar img{width:100%;height:100%;object-fit:cover}
.attendance-employee-cell strong{display:block;font-size:12px;font-weight:700;color:var(--text)}
.attendance-employee-cell small{display:block;margin-top:2px;color:var(--muted);font-size:10px}
.attendance-table .form-control{min-height:36px;border:1px solid #dbe4f0;border-radius:9px;background:#fff;padding:7px 9px;font:inherit;font-size:11.5px;color:var(--text);box-sizing:border-box;max-width:100%}
.attendance-table .attendance-status-select{min-width:135px;width:135px}
.attendance-table .attendance-note-input{min-width:180px;width:100%;max-width:250px}
.attendance-table .btn{min-height:34px;border-radius:9px;padding:7px 12px}
@media(max-width:650px){
 .attendance-person-row{grid-template-columns:18px 36px minmax(0,1fr);gap:9px;padding:9px 10px}
 .attendance-person-avatar{width:36px;height:36px}
 .attendance-person-id{grid-column:3;margin-top:-7px}
 .attendance-people-list{max-height:260px}
}

.attendance-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 16px;padding:7px;background:var(--surface-2,#f1f5f9);border-radius:12px}
  .attendance-tab{border:0;background:transparent;border-radius:9px;padding:10px 13px;display:inline-flex;align-items:center;gap:7px;color:var(--muted);font-weight:600;cursor:pointer}
  .attendance-tab.active{background:var(--surface,#fff);color:var(--text);box-shadow:0 1px 4px rgba(15,23,42,.10)}
  .attendance-tab .material-symbols-rounded{font-size:18px}
  .attendance-setup-sections{display:grid;gap:15px;margin-top:18px}
  .attendance-setup-section{padding:15px;border:1px solid var(--border,#e2e8f0);border-radius:12px}
  .attendance-setup-section h3{font-size:14px;margin:0 0 13px;font-weight:700}
  .attendance-info-strip,.attendance-note-display{padding:10px 12px;border-radius:9px;background:var(--surface-2,#f8fafc);color:var(--muted);font-size:12px;margin-top:10px;line-height:1.55}
  .attendance-note-display{color:var(--text);white-space:pre-wrap}
  .attendance-progress{height:6px;border-radius:99px;background:var(--surface-2,#e2e8f0);overflow:hidden;margin-top:10px}
  .attendance-progress span{display:block;height:100%;background:#16a34a;border-radius:99px}
  .attendance-overview-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
  .attendance-overview-stats>div{padding:13px;border:1px solid var(--border,#e2e8f0);border-radius:10px;display:flex;flex-direction:column;gap:4px}
  .attendance-overview-stats strong{font-size:22px}.attendance-overview-stats span{font-size:12px;color:var(--muted)}
  .attendance-note-input{min-width:170px;max-width:240px}
  @media(max-width:650px){.attendance-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.attendance-tab{justify-content:center;padding:9px 6px;font-size:12px}.attendance-overview-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  document.head.appendChild(style);
}
function attendanceLocalDateTime(d){
  const date=new Date(d); if(isNaN(date))return '';
  const pad=n=>String(n).padStart(2,'0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function attendanceFormatDate(value){
  if(!value)return '—';const d=new Date(value);return isNaN(d)?'—':d.toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'});
}
function attendanceStatusClass(status){
  if(status==='Đang mở')return 'open';if(status==='Đã kết thúc')return 'closed';if(status==='Có mặt')return 'present';if(status==='Vắng')return 'absent';return '';
}

function attendancePersonAvatar(employee,size=40){
  const id=String(employee?.id||'').trim();
  const canonical=findEmployee(id);
  if(canonical)return avatarHtml(id,size);
  const name=String(employee?.name||'?');
  const raw=String(employee?.avatarUrl||'').trim();
  const file=raw.match(/^drive-file:(.+)$/i);
  const style=`width:${size}px;height:${size}px;flex:0 0 ${size}px;border-radius:50%;overflow:hidden`;
  if(file&&file[1])return `<span class="avatar avatar-photo avatar-lazy" data-avatar-file-id="${escapeAttr(file[1])}" data-avatar-employee-id="${escapeAttr(id)}" style="${style}" title="${escapeAttr(name)}">${escapeHtml(initials(name))}</span>`;
  if(/^https?:\/\//i.test(raw)||/^data:image\//i.test(raw))return `<span class="avatar avatar-photo" style="${style}" title="${escapeAttr(name)}"><img src="${escapeAttr(raw)}" alt="${escapeAttr(name)}" style="width:100%;height:100%;object-fit:cover"></span>`;
  return `<span class="avatar" style="${style}" title="${escapeAttr(name)}">${escapeHtml(initials(name))}</span>`;
}

function renderAttendance(){
  ensureAttendanceUiStyles();
  const root=document.getElementById('page-content');if(!root)return;
  const manager=['Quản trị','Quản lý'].includes(APP.session?.role);
  root.innerHTML=`<div class="page-shell">
    ${pageHead('Điểm danh','Tự điểm danh hoặc quét mã QR bằng camera theo tài khoản đang đăng nhập; đồng thời theo dõi chuyên cần.',`${manager?'<button class="btn" data-action="attendance-refresh"><span class="material-symbols-rounded">sync</span>Đồng bộ</button>':''}<button class="btn btn-primary" data-action="attendance-camera"><span class="material-symbols-rounded">qr_code_scanner</span>Quét QR bằng camera</button>`)}
    <div id="attendance-content"><div class="panel attendance-empty">Đang tải dữ liệu điểm danh...</div></div>
  </div>`;
  loadAttendanceData();
  startAttendancePolling();
}
function startAttendancePolling(){
  stopAttendancePolling();
  APP.state.attendanceTimer=setInterval(()=>{
    if(APP.state.page==='attendance' && !APP.state.attendanceBusy) loadAttendanceData(true);
  },5000);
}
function stopAttendancePolling(){
  if(APP.state.attendanceTimer){clearInterval(APP.state.attendanceTimer);APP.state.attendanceTimer=null;}
}
async function loadAttendanceData(silent=false){
  const root=document.getElementById('attendance-content');if(!root||APP.state.attendanceBusy)return;
  APP.state.attendanceBusy=true;
  if(!silent)root.innerHTML='<div class="panel attendance-empty">Đang đồng bộ dữ liệu...</div>';
  try{
    const data=await gas('getAttendanceData',APP.token,{timeout:45000});
    APP.state.attendanceData=data;
    if(APP.state.page==='attendance' && !(silent && (APP.state.attendanceTab||'overview')==='setup')) renderAttendanceContent(data);
  }catch(err){
    if(!silent)root.innerHTML=`<div class="panel attendance-empty">${escapeHtml(err.message||'Không thể tải dữ liệu điểm danh.')}</div>`;
  }finally{APP.state.attendanceBusy=false;}
}
function toggleAttendancePerson(el){
  const id=String(el?.value||''); if(!id)return;
  const set=new Set((APP.state.attendanceSelectedIds||[]).map(String));
  if(el.checked)set.add(id);else set.delete(id);
  APP.state.attendanceSelectedIds=[...set];
  updateAttendancePeopleSelectionUi();
}
function toggleAllAttendancePeople(checked){
  const boxes=[...document.querySelectorAll('.attendance-person-check')];
  boxes.forEach(cb=>{cb.checked=Boolean(checked);});
  APP.state.attendanceSelectedIds=checked?boxes.map(cb=>String(cb.value)):[];
  updateAttendancePeopleSelectionUi();
}
function updateAttendancePeopleSelectionUi(){
  const boxes=[...document.querySelectorAll('.attendance-person-check')];
  const selected=new Set((APP.state.attendanceSelectedIds||[]).map(String));
  const count=document.getElementById('attendance-selected-count');
  if(count)count.textContent=selected.size+'/'+boxes.length+' thành viên';
  const all=document.getElementById('attendance-select-all');
  if(all){all.checked=boxes.length>0&&boxes.every(cb=>selected.has(String(cb.value)));all.indeterminate=boxes.some(cb=>selected.has(String(cb.value)))&&!all.checked;}
  boxes.forEach(cb=>{cb.checked=selected.has(String(cb.value));});
}
function filterAttendancePeople(value){
  const q=String(value||'').trim().toLowerCase();
  document.querySelectorAll('[data-attendance-person-row]').forEach(row=>{row.style.display=!q||String(row.dataset.search||'').includes(q)?'flex':'none';});
}
function renderAttendanceContent(data){
  const root=document.getElementById('attendance-content');if(!root)return;
  const sessions=data.sessions||[],logs=data.logs||[],me=String(data.myEmployeeId||'');
  const canManage=Boolean(data.canManage), isAdmin=Boolean(data.canManageAll);
  const teams=data.teams||[], employees=data.employees||[];
  if(!APP.state.attendanceSelectionInitialized && employees.length){
    APP.state.attendanceSelectedIds=employees.map(e=>String(e.id));
    APP.state.attendanceSelectionInitialized=true;
  } else if(!Array.isArray(APP.state.attendanceSelectedIds)){
    APP.state.attendanceSelectedIds=[];
  }
  // Loại bỏ mã nhân sự không còn nằm trong phạm vi được phép, không làm mất
  // lựa chọn hiện tại khi dữ liệu được đồng bộ nền.
  const permittedEmployeeIds=new Set(employees.map(e=>String(e.id)));
  APP.state.attendanceSelectedIds=(APP.state.attendanceSelectedIds||[]).map(String).filter(id=>permittedEmployeeIds.has(id));
  const selectedAttendanceIds=APP.state.attendanceSelectedIds;
  const active=sessions.filter(s=>s.status==='Đang mở').length;
  const present=logs.filter(l=>l.status==='Có mặt').length;
  const late=logs.filter(l=>l.status==='Đi muộn').length;
  const absent=logs.filter(l=>l.status==='Vắng').length;
  const excused=logs.filter(l=>l.status==='Có phép').length;
  const total=logs.length;
  const tab=APP.state.attendanceTab||'overview';
  const attendanceEmployeeRows=employees.map(e=>`<label class="attendance-person-row" data-attendance-person-row data-search="${escapeAttr(normalizeText((e.name||'')+' '+(e.id||'')+' '+(e.team||'')))}"><input type="checkbox" class="attendance-person-check" value="${escapeAttr(e.id)}" ${selectedAttendanceIds.includes(String(e.id))?'checked':''} onchange="toggleAttendancePerson(this)"><span class="attendance-person-avatar">${attendancePersonAvatar(e,40)}</span><span class="attendance-person-name"><strong>${escapeHtml(e.name||'Chưa có tên')}</strong><small>${escapeHtml(e.team||'Chưa phân nhóm')}</small></span><small class="attendance-person-id">${escapeHtml(e.id||'')}</small></label>`).join('');
  const attendanceAllSelected=employees.length>0 && employees.every(e=>selectedAttendanceIds.includes(String(e.id)));
  const now=new Date(), defaultStart=new Date(now.getTime()+5*60000);
  defaultStart.setSeconds(0,0);
  const defaultEnd=new Date(defaultStart.getTime()+60*60000);
  const sessionsSorted=sessions.slice().sort((a,b)=>new Date(b.startAt)-new Date(a.startAt));
  const sessionsHtml=sessionsSorted.map(s=>{
    const own=logs.find(l=>l.sessionId===s.id&&l.employeeId===me);
    const canCheck=s.status==='Đang mở'&&own&&own.status==='Chưa điểm danh';
    const count=logs.filter(l=>l.sessionId===s.id);
    const done=count.filter(l=>['Có mặt','Đi muộn'].includes(l.status)).length;
    const pct=count.length?Math.round(done/count.length*100):0;
    return `<article class="attendance-session ${s.status==='Đang mở'?'active':''}">
      <div class="attendance-session-top"><div><h3>${escapeHtml(s.title)}</h3><div class="attendance-meta">${escapeHtml(s.teamName||'Toàn bộ nhân sự')}<br>Mở: ${attendanceFormatDate(s.startAt)}<br>Kết thúc: ${attendanceFormatDate(s.endAt)}</div></div><span class="attendance-status ${attendanceStatusClass(s.status)}">${escapeHtml(s.status)}</span></div>
      <div class="attendance-progress"><span style="width:${pct}%"></span></div>
      <div class="attendance-meta" style="margin-top:7px">Đã ghi nhận ${done}/${count.length} (${pct}%) · Vắng ${count.filter(l=>l.status==='Vắng').length} · Có phép ${count.filter(l=>l.status==='Có phép').length}</div>
      ${s.note?`<div class="attendance-note-display"><strong>Ghi chú:</strong> ${escapeHtml(s.note)}</div>`:''}
      ${own?`<div style="margin-top:10px"><span class="attendance-status ${attendanceStatusClass(own.status)}">${escapeHtml(own.status)}</span> ${own.checkedAt?`<span class="attendance-meta">Lúc ${attendanceFormatDate(own.checkedAt)}</span>`:''}</div>`:''}
      ${canCheck?`<button class="btn btn-primary btn-sm" style="margin-top:10px" data-action="attendance-checkin" data-id="${escapeAttr(s.id)}"><span class="material-symbols-rounded">how_to_reg</span>Tôi đang tham gia – Điểm danh</button>`:''}
      ${canManage && s.status==='Đang mở'?`<button class="btn btn-sm" style="margin:10px 0 0 6px" data-action="attendance-qr" data-id="${escapeAttr(s.id)}"><span class="material-symbols-rounded">qr_code_2</span>Mã QR</button>`:''}
      ${canManage?`<button class="btn btn-sm" style="margin:10px 0 0 6px" data-action="attendance-edit" data-id="${escapeAttr(s.id)}"><span class="material-symbols-rounded">edit</span>Sửa</button><button class="btn btn-sm" style="margin:10px 0 0 6px" data-action="attendance-delete" data-id="${escapeAttr(s.id)}"><span class="material-symbols-rounded">delete</span>Xóa</button>`:''}
      ${s.status==='Sắp diễn ra'?'<div class="attendance-meta" style="margin-top:8px">Buổi sẽ tự mở khi đến thời gian bắt đầu.</div>':''}
    </article>`;
  }).join('');

  const summaryByEmployee=employees.map(emp=>{
    const own=logs.filter(l=>l.employeeId===emp.id);
    const denominator=own.length;
    const p=own.filter(l=>l.status==='Có mặt').length;
    const l=own.filter(x=>x.status==='Đi muộn').length;
    const a=own.filter(x=>x.status==='Vắng').length;
    const e=own.filter(x=>x.status==='Có phép').length;
    const pending=own.filter(x=>x.status==='Chưa điểm danh').length;
    const rate=denominator?Math.round((p+l)/denominator*100):0;
    return {emp,denominator,p,l,a,e,pending,rate};
  });
  const summaryRows=summaryByEmployee.map(x=>`<tr>
    <td><strong>${escapeHtml(x.emp.name)}</strong><div class="attendance-meta">${escapeHtml(x.emp.id)} · ${escapeHtml(x.emp.team||'Chưa phân nhóm')}</div></td>
    <td>${x.denominator}</td><td>${x.p}</td><td>${x.l}</td><td>${x.a}</td><td>${x.e}</td><td>${x.pending}</td>
    <td><strong>${x.rate}%</strong><div class="attendance-progress"><span style="width:${x.rate}%"></span></div></td>
  </tr>`).join('');

  const logRows=(canManage?logs:logs.filter(l=>l.employeeId===me))
    .slice().sort((a,b)=>new Date(b.checkedAt||0)-new Date(a.checkedAt||0))
    .map(l=>`<tr>
      <td><div class="attendance-employee-cell">${attendancePersonAvatar(employees.find(e=>String(e.id)===String(l.employeeId))||{id:l.employeeId,name:l.employeeName},36)}<span><strong>${escapeHtml(l.employeeName)}</strong><small>${escapeHtml(l.employeeId||'')}</small></span></div></td><td>${escapeHtml(l.teamName)}</td>
      <td>${escapeHtml((sessions.find(s=>s.id===l.sessionId)||{}).title||l.sessionId)}</td>
      <td>${canManage?`<select class="form-control attendance-status-select" id="att-status-${escapeAttr(l.sessionId)}-${escapeAttr(l.employeeId)}">
        ${['Chưa điểm danh','Có mặt','Đi muộn','Vắng','Có phép'].map(v=>`<option ${l.status===v?'selected':''}>${v}</option>`).join('')}
      </select>`:`<span class="attendance-status ${attendanceStatusClass(l.status)}">${escapeHtml(l.status)}</span>`}</td>
      <td>${canManage?`<input class="form-control attendance-note-input" id="att-note-${escapeAttr(l.sessionId)}-${escapeAttr(l.employeeId)}" maxlength="500" value="${escapeAttr(l.note||'')}" placeholder="Ghi chú / lý do">`:(escapeHtml(l.note||'—'))}</td>
      <td>${attendanceFormatDate(l.checkedAt)}</td>
      ${canManage?`<td><button class="btn btn-sm" data-action="attendance-status-save" data-session="${escapeAttr(l.sessionId)}" data-employee="${escapeAttr(l.employeeId)}">Lưu</button></td>`:''}
    </tr>`).join('');

  const navTabs=[
    ['overview','Tổng quan','dashboard'],
    ...(canManage?[['setup','Thiết lập','tune'],['sessions','Quản lý buổi','event_note'],['summary','Tổng hợp chuyên cần','groups']]:[['sessions','Các buổi điểm danh','event_note'],['summary','Chuyên cần của tôi','person']]),
    ['history','Lịch sử chi tiết','history']
  ];
  const tabsHtml=navTabs.map(([id,label,icon])=>`<button class="attendance-tab ${tab===id?'active':''}" data-action="attendance-tab" data-tab="${id}"><span class="material-symbols-rounded">${icon}</span>${label}</button>`).join('');

  let panel='';
  if(tab==='overview'){
    panel=`<div class="attendance-grid">
      <section class="panel" style="padding:18px"><div class="section-title-row"><div><h2 style="margin:0;font-size:16px">Buổi đang diễn ra</h2><p class="attendance-meta">Các lịch đang mở và trạng thái tham gia của bạn.</p></div></div>
      ${sessionsSorted.some(s=>s.status==='Đang mở')?sessionsSorted.filter(s=>s.status==='Đang mở').map(s=>{
        const own=logs.find(l=>l.sessionId===s.id&&l.employeeId===me);
        const canCheck=s.status==='Đang mở'&&own&&own.status==='Chưa điểm danh';
        return `<article class="attendance-session active"><div class="attendance-session-top"><div><h3>${escapeHtml(s.title)}</h3><div class="attendance-meta">${escapeHtml(s.teamName||'Toàn bộ nhân sự')} · Kết thúc ${attendanceFormatDate(s.endAt)}</div></div><span class="attendance-status open">Đang mở</span></div>${s.note?`<div class="attendance-note-display">${escapeHtml(s.note)}</div>`:''}${own?`<p><span class="attendance-status">${escapeHtml(own.status)}</span></p>`:''}${canCheck?`<button class="btn btn-primary btn-sm" data-action="attendance-checkin" data-id="${escapeAttr(s.id)}">Tôi đang tham gia – Điểm danh</button>`:''}</article>`;
      }).join(''):'<div class="attendance-empty">Hiện không có buổi nào đang mở.</div>'}
      </section>
      <section class="panel" style="padding:18px"><h2 style="margin:0 0 12px;font-size:16px">Tình hình chuyên cần</h2>
        <div class="attendance-overview-stats"><div><strong>${present}</strong><span>Có mặt</span></div><div><strong>${late}</strong><span>Đi muộn</span></div><div><strong>${absent}</strong><span>Vắng</span></div><div><strong>${excused}</strong><span>Có phép</span></div></div>
        <p class="attendance-meta">Dữ liệu được đồng bộ tự động mỗi 5 giây khi đang mở trang.</p>
      </section>
    </div>
    <section class="panel" style="padding:16px;margin-top:14px"><div class="section-title-row"><h2 style="margin:0;font-size:16px">Lịch sắp diễn ra / gần đây</h2><button class="btn btn-sm" data-action="attendance-tab" data-tab="sessions">Xem tất cả</button></div>
      ${sessionsSorted.length?sessionsHtml:'<div class="attendance-empty">Chưa có lịch điểm danh.</div>'}
    </section>`;
  } else if(tab==='setup' && canManage){
    panel=`<section class="panel" style="padding:18px">
      <div class="section-title-row"><div><h2 style="margin:0;font-size:17px">Thiết lập buổi điểm danh</h2><p class="attendance-meta">Cấu hình đối tượng, thời gian, cách vận hành và nội dung thông báo trước khi tạo lịch.</p></div><span class="attendance-status">Quản lý</span></div>
      <div class="attendance-setup-sections">
        <div class="attendance-setup-section"><h3>01 · Thông tin buổi</h3><div class="attendance-form-grid">
          <div class="field full"><label for="attendance-title">Tên buổi điểm danh *</label><input id="attendance-title" class="form-control" maxlength="150" placeholder="Ví dụ: Sinh hoạt định kỳ tuần 1"></div>
          <div class="field full"><div class="attendance-people-picker"><div class="attendance-people-heading"><strong>Người tham gia</strong><span class="attendance-meta" id="attendance-selected-count">${selectedAttendanceIds.length}/${employees.length} thành viên</span></div><div class="attendance-people-search"><span class="material-symbols-rounded">search</span><input type="search" id="attendance-people-search" placeholder="Tìm nhân sự theo mã, tên hoặc Nhóm..." oninput="filterAttendancePeople(this.value)"></div><label class="attendance-people-all"><input type="checkbox" id="attendance-select-all" ${attendanceAllSelected?'checked':''} onchange="toggleAllAttendancePeople(this.checked)"><span><strong>Chọn tất cả thành viên</strong><small>Chọn hoặc bỏ chọn toàn bộ ${employees.length} thành viên</small></span></label><div class="attendance-people-list" id="attendance-people-list">${attendanceEmployeeRows||'<div class="attendance-meta" style="padding:16px">Không có nhân sự trong phạm vi được phép.</div>'}</div></div><small class="attendance-meta">Chọn những thành viên cần điểm danh. Mặc định hệ thống chọn toàn bộ thành viên.</small></div>
        </div></div>
        <div class="attendance-setup-section"><h3>02 · Thời gian điểm danh</h3><div class="attendance-form-grid">
          <div class="field"><label>Thời gian bắt đầu *</label><div class="attendance-datetime"><input id="attendance-start-date" type="date" class="form-control" value="${attendanceLocalDateTime(defaultStart).slice(0,10)}"><input id="attendance-start-time" type="time" class="form-control" value="${attendanceLocalDateTime(defaultStart).slice(11,16)}"></div></div>
          <div class="field"><label>Thời gian kết thúc *</label><div class="attendance-datetime"><input id="attendance-end-date" type="date" class="form-control" value="${attendanceLocalDateTime(defaultEnd).slice(0,10)}"><input id="attendance-end-time" type="time" class="form-control" value="${attendanceLocalDateTime(defaultEnd).slice(11,16)}"></div></div>
        </div><div class="attendance-info-strip">Hệ thống tự mở cổng vào giờ bắt đầu và tự đóng khi đến giờ kết thúc. Thời lượng tối đa hiện tại là 24 giờ.</div></div>
        <div class="attendance-setup-section"><h3>03 · Nội dung và lưu ý</h3><div class="attendance-form-grid"><div class="field full"><label for="attendance-note">Ghi chú / Nội dung yêu cầu</label><textarea id="attendance-note" class="form-control attendance-note-textarea" rows="4" maxlength="1000" placeholder="Nhập nội dung buổi sinh hoạt, yêu cầu chuẩn bị, địa điểm hoặc lưu ý dành cho thành viên..."></textarea><small class="attendance-meta">Thông tin này sẽ hiển thị trong buổi điểm danh để thành viên nắm rõ nội dung và yêu cầu cần chuẩn bị.</small></div></div></div>
        <div class="attendance-setup-section"><h3>04 · Cơ chế vận hành</h3>
          <label class="attendance-schedule-toggle"><input id="attendance-schedule-enabled" type="checkbox" checked><span><strong>Hẹn lịch tự động mở cổng điểm danh</strong><small>Bật: mở theo thời gian đã đặt. Tắt: mở ngay sau khi lưu, nhưng vẫn đóng theo giờ kết thúc đã chọn.</small></span></label>
          <div class="attendance-info-strip">Sau khi tạo buổi, hệ thống lập danh sách nhân sự tại thời điểm tạo. Khi hết giờ, các trường hợp chưa điểm danh tự chuyển thành Vắng.</div>
        </div>
      </div>
      <div class="attendance-form-actions"><button class="btn btn-primary" data-action="attendance-create"><span class="material-symbols-rounded">event_available</span>Tạo lịch điểm danh</button><button class="btn" data-action="attendance-setup-automation"><span class="material-symbols-rounded">schedule</span>Kiểm tra tự động hóa</button></div>
    </section>`;
  } else if(tab==='sessions'){
    panel=`<section class="panel" style="padding:16px"><div class="section-title-row"><div><h2 style="margin:0;font-size:17px">Danh sách buổi điểm danh</h2><p class="attendance-meta">Theo dõi trạng thái, thời gian và tỷ lệ ghi nhận của từng buổi.</p></div>${canManage?'<button class="btn btn-primary btn-sm" data-action="attendance-tab" data-tab="setup">Tạo buổi mới</button>':''}</div>
      ${sessionsHtml||'<div class="attendance-empty">Chưa có buổi điểm danh nào trong phạm vi của bạn.</div>'}
    </section>`;
  } else if(tab==='summary'){
    panel=`<section class="panel" style="padding:16px"><div class="section-title-row"><div><h2 style="margin:0;font-size:17px">${canManage?'Tổng hợp chuyên cần theo nhân sự':'Tổng hợp chuyên cần của tôi'}</h2><p class="attendance-meta">Tỷ lệ tham gia = (Có mặt + Đi muộn) / Tổng lượt được phân công.</p></div><button class="btn btn-sm" data-action="attendance-refresh">Làm mới</button></div>
      ${canManage?`<div class="attendance-table-wrap"><table class="attendance-table"><thead><tr><th>Nhân sự</th><th>Tổng buổi</th><th>Có mặt</th><th>Đi muộn</th><th>Vắng</th><th>Có phép</th><th>Chưa điểm danh</th><th>Tỷ lệ tham gia</th></tr></thead><tbody>${summaryRows||'<tr><td colspan="8" class="attendance-empty">Chưa có dữ liệu.</td></tr>'}</tbody></table></div>`:
      `<div class="attendance-overview-stats"><div><strong>${logs.filter(l=>l.employeeId===me).length}</strong><span>Tổng buổi</span></div><div><strong>${logs.filter(l=>l.employeeId===me&&l.status==='Có mặt').length}</strong><span>Có mặt</span></div><div><strong>${logs.filter(l=>l.employeeId===me&&l.status==='Đi muộn').length}</strong><span>Đi muộn</span></div><div><strong>${logs.filter(l=>l.employeeId===me&&l.status==='Vắng').length}</strong><span>Vắng</span></div></div>`}
    </section>`;
  } else {
    panel=`<section class="panel" style="padding:16px"><div class="section-title-row"><div><h2 style="margin:0;font-size:17px">${canManage?'Nhật ký điểm danh chi tiết':'Lịch sử điểm danh của tôi'}</h2><p class="attendance-meta">Quản lý có thể điều chỉnh trạng thái và ghi chú lý do cho từng nhân sự.</p></div><button class="btn btn-sm" data-action="attendance-refresh">Đồng bộ</button></div>
      <div class="attendance-table-wrap"><table class="attendance-table"><thead><tr><th>Nhân sự</th><th>Đội/Nhóm</th><th>Buổi</th><th>Trạng thái</th><th>Ghi chú / Lý do</th><th>Thời gian</th>${canManage?'<th>Thao tác</th>':''}</tr></thead><tbody>${logRows||`<tr><td colspan="${canManage?7:6}" class="attendance-empty">Chưa có dữ liệu điểm danh.</td></tr>`}</tbody></table></div>
    </section>`;
  }
  root.innerHTML=`
    <div class="attendance-kpis">
      <div class="attendance-kpi"><span class="attendance-meta">Tổng số buổi</span><strong>${sessions.length}</strong></div>
      <div class="attendance-kpi"><span class="attendance-meta">Buổi đang mở</span><strong>${active}</strong></div>
      <div class="attendance-kpi"><span class="attendance-meta">Lượt có mặt</span><strong>${present}</strong></div>
      <div class="attendance-kpi"><span class="attendance-meta">Lượt vắng</span><strong>${absent}</strong></div>
    </div>
    <nav class="attendance-tabs" aria-label="Phân hệ điểm danh">${tabsHtml}</nav>
    ${panel}`;
  if(typeof initLazyEmployeeAvatars==='function')requestAnimationFrame(()=>initLazyEmployeeAvatars(root));
}
async function createAttendanceFromForm(){
  const title=document.getElementById('attendance-title')?.value.trim();
  const employeeIds=[...new Set((APP.state.attendanceSelectedIds||[]).map(String).filter(Boolean))];
  const startDate=document.getElementById('attendance-start-date')?.value;
  const startTime=document.getElementById('attendance-start-time')?.value;
  const endDate=document.getElementById('attendance-end-date')?.value;
  const endTime=document.getElementById('attendance-end-time')?.value;
  const note=document.getElementById('attendance-note')?.value.trim()||'';
  const scheduled=document.getElementById('attendance-schedule-enabled')?.checked!==false;
  if(!title||!startDate||!startTime||!endDate||!endTime){showToast('Thiếu thông tin','Vui lòng nhập tên buổi và đầy đủ ngày, giờ bắt đầu/kết thúc.','warning');return;}
  if(!employeeIds.length){showToast('Chưa chọn thành viên','Vui lòng chọn ít nhất một thành viên tham gia điểm danh.','warning');return;}
  const startLocal=new Date(`${startDate}T${startTime}:00`);
  const endLocal=new Date(`${endDate}T${endTime}:00`);
  if(isNaN(startLocal.getTime())||isNaN(endLocal.getTime())){showToast('Thời gian không hợp lệ','Vui lòng kiểm tra lại ngày và giờ đã chọn.','warning');return;}
  const startAt=scheduled?startLocal:new Date();
  if(endLocal<=startAt){showToast('Khoảng thời gian không hợp lệ','Thời gian kết thúc phải sau thời gian bắt đầu/mở cổng.','warning');return;}
  if(scheduled&&startAt.getTime()<Date.now()-60000){showToast('Thời gian bắt đầu đã qua','Hãy chọn thời điểm hiện tại hoặc trong tương lai, hoặc tắt chế độ hẹn lịch để mở ngay.','warning');return;}
  const btn=document.querySelector('[data-action="attendance-create"]');
  if(btn)setButtonBusy(btn,true,'Đang lưu lịch');
  try{
    await gas('createAttendanceSession',{title,employeeIds,startAt:startAt.toISOString(),endAt:endLocal.toISOString(),note},APP.token,{timeout:60000});
    showToast(scheduled?'Đã đặt lịch điểm danh':'Đã mở buổi điểm danh','Hệ thống đã tạo danh sách thành viên và thiết lập tự động mở/đóng cổng theo thời gian.','success');
    await loadAttendanceData();
  }catch(err){showToast('Không thể tạo lịch',err.message||'Đã xảy ra lỗi.','error',5500);}
  finally{if(btn)setButtonBusy(btn,false);}
}
async function submitAttendance(id){
  if(!id)return;
  const btn=document.querySelector(`[data-action="attendance-checkin"][data-id="${CSS.escape(id)}"]`);
  if(btn)setButtonBusy(btn,true,'Đang điểm danh');
  try{
    await gas('markAttendance',id,APP.token,{timeout:45000});
    showToast('Điểm danh thành công','Thời gian tham gia đã được ghi nhận.','success',3500);
    await loadAttendanceData();
  }catch(err){showToast('Không thể điểm danh',err.message||'Đã xảy ra lỗi.','warning',5000);}
  finally{if(btn&&btn.isConnected)setButtonBusy(btn,false);}
}

function openAttendanceEditModal(sessionId){
  const session=(APP.state.attendanceData?.sessions||[]).find(x=>x.id===sessionId);
  if(!session)return;
  const body=`<div class="form-grid"><div class="form-field full"><label>Tên buổi điểm danh *</label><input id="attendance-edit-title" class="form-control" value="${escapeAttr(session.title)}"></div><div class="form-field"><label>Thời gian bắt đầu *</label><input id="attendance-edit-start" type="datetime-local" class="form-control" value="${attendanceLocalDateTime(session.startAt)}"></div><div class="form-field"><label>Thời gian kết thúc *</label><input id="attendance-edit-end" type="datetime-local" class="form-control" value="${attendanceLocalDateTime(session.endAt)}"></div><div class="form-field full"><label>Ghi chú</label><textarea id="attendance-edit-note" class="form-control" rows="3">${escapeHtml(session.note||'')}</textarea></div></div>`;
  openModal(modalShell('Chỉnh sửa buổi điểm danh',session.title,body,`<button class="btn" data-action="close-modal">Hủy</button><button class="btn btn-primary" data-action="attendance-edit-save" data-id="${escapeAttr(session.id)}">Lưu thay đổi</button>`,'small'));
}
async function saveAttendanceSessionFromForm(sessionId){
  const title=document.getElementById('attendance-edit-title')?.value.trim();
  const startAt=document.getElementById('attendance-edit-start')?.value;
  const endAt=document.getElementById('attendance-edit-end')?.value;
  const note=document.getElementById('attendance-edit-note')?.value.trim()||'';
  if(!title||!startAt||!endAt){showToast('Thiếu thông tin','Vui lòng nhập tên buổi và thời gian bắt đầu/kết thúc.','warning');return;}
  try{await gas('updateAttendanceSession',{id:sessionId,title,startAt:new Date(startAt).toISOString(),endAt:new Date(endAt).toISOString(),note},APP.token,{timeout:45000});closeModal();showToast('Đã cập nhật lịch','Thông tin buổi điểm danh đã được cập nhật.','success');await loadAttendanceData();}
  catch(err){showToast('Không thể cập nhật lịch',err.message||'Đã xảy ra lỗi.','warning',5000);}
}
async function deleteAttendanceSessionFromUi(sessionId){
  const session=(APP.state.attendanceData?.sessions||[]).find(x=>x.id===sessionId);
  if(!session||!window.confirm(`Bạn có chắc muốn xóa buổi “${session.title}” và toàn bộ lịch sử điểm danh của buổi này? Thao tác không thể hoàn tác.`))return;
  try{await gas('deleteAttendanceSession',sessionId,APP.token,{timeout:60000});showToast('Đã xóa buổi điểm danh','Lịch và các bản ghi liên quan đã được xóa.','success');await loadAttendanceData();}
  catch(err){showToast('Không thể xóa buổi',err.message||'Đã xảy ra lỗi.','warning',5000);}
}

async function saveAttendanceStatus(sessionId, employeeId){
  const select=document.getElementById(`att-status-${sessionId}-${employeeId}`); if(!select)return;
  const note=document.getElementById(`att-note-${sessionId}-${employeeId}`)?.value||'';
  try{await gas('updateAttendanceStatus',sessionId,employeeId,select.value,note,APP.token,{timeout:45000});showToast('Đã cập nhật điểm danh','Trạng thái chuyên cần đã được lưu.','success',3000);await loadAttendanceData(true);}
  catch(err){showToast('Không thể cập nhật',err.message||'Đã xảy ra lỗi.','warning',4500);}
}
async function setupAttendanceAutomationUi(){
  const btn=document.querySelector('[data-action="attendance-setup-automation"]');
  if(btn)setButtonBusy(btn,true,'Đang kiểm tra');
  try{
    const result=await gas('setupAttendanceAutomation',APP.token,{timeout:45000});
    showToast('Tự động hóa đã sẵn sàng',result?.message||'Bộ tự động mở và đóng cổng đã được kích hoạt.','success',4500);
  }catch(err){showToast('Chưa thiết lập được tự động hóa',err.message||'Vui lòng kiểm tra quyền Apps Script.','warning',5500);}
  finally{if(btn&&btn.isConnected)setButtonBusy(btn,false);}
}

let attendanceQrScannerInstance = null;
let attendanceQrScannerBusy = false;
let attendanceCameraStarting = false;
let attendanceCameraOverlay = null;

async function loadHtml5QrScannerLibrary(){
  if(window.Html5Qrcode) return true;
  if(window.__attendanceQrLibraryPromise) return window.__attendanceQrLibraryPromise;

  window.__attendanceQrLibraryPromise = (async()=>{
    const sources = [
      'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
      'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js'
    ];
    let lastError = null;

    for(const source of sources){
      try{
        await new Promise((resolve,reject)=>{
          const script = document.createElement('script');
          script.src = source;
          script.async = true;
          script.onload = ()=>{
            if(window.Html5Qrcode) resolve();
            else reject(new Error('Thư viện QR không khởi tạo được.'));
          };
          script.onerror = ()=>reject(new Error('Không tải được thư viện QR từ '+source));
          document.head.appendChild(script);
        });
        if(window.Html5Qrcode) return true;
      }catch(err){
        lastError = err;
      }
    }

    window.__attendanceQrLibraryPromise = null;
    throw new Error('Không tải được thư viện quét QR. Hãy kiểm tra kết nối Internet hoặc mạng đang chặn CDN. '+(lastError?.message||''));
  })();

  return window.__attendanceQrLibraryPromise;
}

async function stopAttendanceCamera(){
  const scanner = attendanceQrScannerInstance;
  attendanceQrScannerInstance = null;
  attendanceQrScannerBusy = false;
  attendanceCameraStarting = false;

  if(scanner){
    try{
      if(scanner.isScanning) await scanner.stop();
    }catch(err){
      console.warn('Không thể dừng camera bình thường:',err);
    }
    try{ await scanner.clear(); }catch(err){}
  }
}

function attendanceCameraErrorMessage(err){
  const name = String(err?.name||'');
  const message = String(err?.message||err||'');

  if(!window.isSecureContext){
    return 'Camera bị trình duyệt chặn vì trang chưa chạy trong ngữ cảnh bảo mật. Hãy mở Web App bằng đường dẫn HTTPS kết thúc bằng /exec.';
  }
  if(name==='NotAllowedError'||name==='PermissionDeniedError'||/permission denied|not allowed/i.test(message)){
    return 'Bạn chưa cấp quyền camera hoặc quyền đang bị chặn. Nhấn biểu tượng quyền trang web cạnh thanh địa chỉ → Camera → Cho phép, sau đó tải lại trang.';
  }
  if(name==='NotFoundError'||name==='DevicesNotFoundError'){
    return 'Không tìm thấy camera trên thiết bị. Hãy kiểm tra camera đã kết nối và được bật trong hệ điều hành.';
  }
  if(name==='NotReadableError'||name==='TrackStartError'){
    return 'Camera đang được ứng dụng khác sử dụng hoặc bị hệ điều hành khóa. Hãy đóng Zoom, Meet, Teams hoặc ứng dụng camera rồi thử lại.';
  }
  if(name==='OverconstrainedError'||name==='ConstraintNotSatisfiedError'){
    return 'Camera không hỗ trợ cấu hình được yêu cầu. Hệ thống sẽ thử camera mặc định; nếu vẫn lỗi, hãy chọn thiết bị khác.';
  }
  if(!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia!=='function'){
    return 'Trình duyệt không hỗ trợ API camera tại trang hiện tại. Hãy mở Web App trực tiếp trong Chrome hoặc Safari, không mở qua bản xem trước/khung nhúng.';
  }
  return message || 'Không thể mở camera. Hãy kiểm tra quyền camera, kết nối Internet và thử lại.';
}

function attendanceSessionIdFromQr(decodedText){
  const raw = String(decodedText||'').trim();
  if(!raw) return '';

  try{
    const url = new URL(raw,window.location.href);
    const id = url.searchParams.get('attendance') || url.searchParams.get('session') || '';
    if(id) return id;
  }catch(err){}

  // Mã QR nội bộ có thể chứa trực tiếp mã buổi điểm danh.
  return /^DD-[A-Z0-9-]+$/i.test(raw) ? raw : '';
}

async function openAttendanceCamera(){
  if(!APP.token){
    showToast('Bạn chưa đăng nhập','Vui lòng đăng nhập tài khoản trước khi quét mã QR.','warning');
    return;
  }
  if(attendanceCameraStarting || attendanceQrScannerInstance){
    showToast('Camera đang hoạt động','Hãy đóng phiên quét hiện tại trước khi mở lại.','info');
    return;
  }

  const overlay = document.createElement('div');
  attendanceCameraOverlay = overlay;
  overlay.className = 'modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10050;background:rgba(15,23,42,.78);display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `<section class="panel" style="width:min(540px,100%);padding:18px;max-height:94vh;overflow:auto">
    <div class="section-title-row">
      <div><h2 style="margin:0;font-size:18px">Quét mã QR điểm danh</h2>
      <p class="attendance-meta" style="margin:5px 0 0">Mã QR được ghi nhận cho tài khoản hiện đang đăng nhập.</p></div>
      <button type="button" class="btn btn-sm" data-attendance-camera-close>Đóng</button>
    </div>
    <div id="attendance-qr-reader" style="width:100%;margin:16px auto 10px;overflow:hidden;border-radius:12px;background:#0f172a;min-height:250px"></div>
    <div id="attendance-camera-message" class="attendance-info-strip" role="status" aria-live="polite">Đang chuẩn bị yêu cầu quyền camera…</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
      <button type="button" class="btn btn-primary btn-sm" data-attendance-camera-retry>Thử cấp quyền / mở lại camera</button>
      <button type="button" class="btn btn-sm" data-attendance-camera-close>Đóng</button>
    </div>
    <p class="attendance-meta" style="margin:10px 0 0">Yêu cầu: mở Web App bằng HTTPS và cho phép Camera trong trình duyệt.</p>
  </section>`;
  document.body.appendChild(overlay);

  const messageEl = overlay.querySelector('#attendance-camera-message');
  const setMessage = text=>{
    if(messageEl) messageEl.textContent = text;
  };

  let closing = false;
  const close = async()=>{
    if(closing) return;
    closing = true;
    await stopAttendanceCamera();
    if(overlay.isConnected) overlay.remove();
    if(attendanceCameraOverlay===overlay) attendanceCameraOverlay=null;
  };

  overlay.addEventListener('click',event=>{
    if(event.target===overlay || event.target.closest('[data-attendance-camera-close]')){
      close();
    }else if(event.target.closest('[data-attendance-camera-retry]')){
      if(!closing) startAttendanceCameraInOverlay(overlay,setMessage,close);
    }
  });

  // Gọi getUserMedia ngay trong thao tác nhấn nút để trình duyệt có thể hiện hộp thoại xin quyền.
  await startAttendanceCameraInOverlay(overlay,setMessage,close);
}

async function startAttendanceCameraInOverlay(overlay,setMessage,close){
  if(!overlay || !overlay.isConnected || attendanceCameraStarting || attendanceQrScannerInstance) return;

  attendanceCameraStarting = true;
  setMessage('Đang kiểm tra quyền truy cập camera…');

  let permissionStream = null;
  let scanner = null;

  try{
    if(!window.isSecureContext){
      throw new Error('Trang chưa chạy bằng HTTPS. Hãy mở đường dẫn Web App kết thúc bằng /exec trực tiếp.');
    }
    if(!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia!=='function'){
      throw new Error('Trình duyệt không cung cấp chức năng camera. Hãy mở Web App trực tiếp trong tab Chrome hoặc Safari.');
    }

    // Yêu cầu quyền camera trước khi tải thư viện QR.
    permissionStream = await navigator.mediaDevices.getUserMedia({
      video:{facingMode:{ideal:'environment'}},
      audio:false
    });
    permissionStream.getTracks().forEach(track=>track.stop());
    permissionStream = null;

    if(!overlay.isConnected) return;
    setMessage('Đã được cấp quyền camera. Đang tải bộ đọc mã QR…');

    await loadHtml5QrScannerLibrary();
    if(!window.Html5Qrcode) throw new Error('Thư viện quét QR chưa sẵn sàng.');
    if(!overlay.isConnected) return;

    scanner = new Html5Qrcode('attendance-qr-reader',{verbose:false});
    attendanceQrScannerInstance = scanner;

    const config = {
      fps:10,
      qrbox:(viewWidth,viewHeight)=>{
        const side = Math.max(160,Math.floor(Math.min(viewWidth,viewHeight)*0.72));
        return {width:Math.min(300,side),height:Math.min(300,side)};
      },
      aspectRatio:1.0,
      disableFlip:false
    };

    const onScanSuccess = async decodedText=>{
      if(attendanceQrScannerBusy) return;

      const sessionId = attendanceSessionIdFromQr(decodedText);
      if(!sessionId){
        setMessage('Mã QR không đúng định dạng điểm danh. Vui lòng quét mã do quản lý tạo.');
        return;
      }

      attendanceQrScannerBusy = true;
      setMessage('Đã nhận mã. Đang xác thực tài khoản và ghi nhận điểm danh…');

      try{
        const result = await gas('markAttendance',sessionId,APP.token,{timeout:45000});
        await close();
        showToast(
          result?.already ? 'Bạn đã điểm danh trước đó' : 'Điểm danh thành công',
          'Hệ thống đã ghi nhận cho tài khoản đang đăng nhập.',
          'success',
          5000
        );
        if(APP.state.page==='attendance') await loadAttendanceData(true);
      }catch(err){
        attendanceQrScannerBusy = false;
        setMessage(err?.message || 'Không thể ghi nhận điểm danh. Hãy kiểm tra buổi điểm danh và thử lại.');
      }
    };

    // Ưu tiên camera sau. Nếu thiết bị không hỗ trợ, thử camera trước/mặc định.
    try{
      await scanner.start({facingMode:'environment'},config,onScanSuccess,()=>{});
    }catch(backCameraError){
      if(!overlay.isConnected) throw backCameraError;
      setMessage('Không mở được camera sau. Đang thử camera mặc định…');
      await scanner.start({facingMode:'user'},config,onScanSuccess,()=>{});
    }

    if(!overlay.isConnected){
      await stopAttendanceCamera();
      return;
    }
    attendanceCameraStarting = false;
    setMessage('Camera đã sẵn sàng. Đưa mã QR vào trong khung hình để điểm danh.');
  }catch(err){
    if(permissionStream){
      try{permissionStream.getTracks().forEach(track=>track.stop());}catch(e){}
    }
    if(scanner){
      try{if(scanner.isScanning) await scanner.stop();}catch(e){}
      try{await scanner.clear();}catch(e){}
    }
    if(attendanceQrScannerInstance===scanner) attendanceQrScannerInstance=null;
    attendanceQrScannerBusy = false;
    attendanceCameraStarting = false;

    const friendly = attendanceCameraErrorMessage(err);
    if(overlay && overlay.isConnected) setMessage(friendly);
    showToast('Không mở được camera',friendly,'warning',7500);
  }
}

function showAttendanceQr(sessionId){
  const session=(APP.state.attendanceData?.sessions||[]).find(s=>s.id===sessionId);
  if(!session||!session.qrUrl){showToast('Không tạo được mã QR','Không tìm thấy địa chỉ Web App đã triển khai. Hãy triển khai lại ứng dụng dưới dạng Web App.','warning',5000);return;}
  const qr='https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data='+encodeURIComponent(session.qrUrl);
  const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.style.cssText='position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.65);display:flex;align-items:center;justify-content:center;padding:18px';
  overlay.innerHTML=`<div class="panel" style="width:min(420px,100%);padding:22px;text-align:center;position:relative"><button class="btn btn-sm" type="button" data-qr-close style="position:absolute;right:12px;top:12px">Đóng</button><h2 style="margin:8px 0">Mã QR điểm danh</h2><p class="attendance-meta">${escapeHtml(session.title)}</p><img src="${qr}" alt="Mã QR điểm danh" style="width:260px;max-width:100%;height:auto;margin:12px auto;display:block;background:#fff;padding:8px;border-radius:10px"><p class="attendance-meta">Thành viên dùng camera điện thoại quét mã, đăng nhập hệ thống và xác nhận điểm danh. Mã chỉ có hiệu lực trong thời gian buổi điểm danh.</p></div>`;
  overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('[data-qr-close]'))overlay.remove();});document.body.appendChild(overlay);
}
async function processAttendanceQrLink(){
  if(APP.state.attendanceQrProcessed)return;
  let sessionId='';try{sessionId=new URLSearchParams(window.location.search).get('attendance')||'';}catch(e){}
  if(!sessionId||!APP.token)return;
  APP.state.attendanceQrProcessed=true;
  try{const result=await gas('markAttendance',sessionId,APP.token,{timeout:45000});showToast(result?.already?'Bạn đã điểm danh trước đó':'Điểm danh thành công','Hệ thống đã ghi nhận thời gian tham gia của bạn.','success',5000);const url=new URL(window.location.href);url.searchParams.delete('attendance');window.history.replaceState({},document.title,url.toString());if(APP.state.page==='attendance')await loadAttendanceData(true);}
  catch(err){showToast('Không thể điểm danh bằng QR',err.message||'Vui lòng mở lại liên kết trong thời gian điểm danh.','warning',6000);APP.state.attendanceQrProcessed=false;}
}


/* ========================= ĐIỂM HỌC TẬP — GRADEBOOK UI ========================= */
function renderLearningGrades(){
  const root=document.getElementById('page-content');if(!root)return;
  const canManage=['Quản trị','Quản lý'].includes(APP.session?.role);
  root.innerHTML=`<div class="page-shell">${pageHead('Điểm học tập','Theo dõi điểm từng môn và học kỳ; công thức được thiết kế linh hoạt, kết quả chỉ hiển thị cho đúng tài khoản sau khi công bố.',`<button class="btn" data-action="learning-grades-refresh"><span class="material-symbols-rounded">sync</span>Làm mới</button>`)}<div id="learning-grades-content"><div class="panel" style="padding:24px;text-align:center">Đang tải dữ liệu điểm học tập...</div></div></div>`;
  loadLearningGrades();
}
async function loadLearningGrades(){
  const root=document.getElementById('learning-grades-content');if(!root||APP.state.learningGradesBusy)return;APP.state.learningGradesBusy=true;
  try{const data=await gas('getLearningGradeData',APP.token,{timeout:60000});APP.state.learningGradesData=data;if(!APP.state.learningGradesSelectedEmployee)APP.state.learningGradesSelectedEmployee=data.me?.employeeId||data.employees?.[0]?.['Mã nhân sự']||'';if(!APP.state.learningGradesSelectedSubject)APP.state.learningGradesSelectedSubject=data.components?.[0]?.['Môn học']||'';if(!APP.state.learningGradesSelectedTerm)APP.state.learningGradesSelectedTerm=data.components?.[0]?.['Học kỳ']||'Học kỳ 1';if(APP.state.page==='learning-grades')renderLearningGradesContent(data);}
  catch(err){if(root)root.innerHTML=`<div class="panel" style="padding:20px"><strong>Không thể tải điểm học tập</strong><p>${escapeHtml(err.message||'Đã xảy ra lỗi.')}</p><button class="btn" data-action="learning-grades-refresh">Thử lại</button></div>`;}
  finally{APP.state.learningGradesBusy=false;}
}
function learningGradeSelect(id,options,value,placeholder='Chọn') {return `<select id="${id}" class="form-control"><option value="">${escapeHtml(placeholder)}</option>${options.map(o=>`<option value="${escapeAttr(String(o.value))}" ${String(o.value)===String(value)?'selected':''}>${escapeHtml(o.label)}</option>`).join('')}</select>`;}
function renderLearningGradesContent(data){
  const root=document.getElementById('learning-grades-content');if(!root)return;const canManage=Boolean(data.canManage),components=data.components||[],scores=data.scores||[],employees=data.employees||[],summary=data.summary||[];
  const subjects=[...new Set(components.map(c=>String(c['Môn học'])))],terms=[...new Set(components.map(c=>String(c['Học kỳ'])))];
  const subject=APP.state.learningGradesSelectedSubject||subjects[0]||'',term=APP.state.learningGradesSelectedTerm||terms[0]||'Học kỳ 1',studentId=APP.state.learningGradesSelectedEmployee||data.me?.employeeId||'';
  const comps=components.filter(c=>String(c['Môn học'])===subject&&String(c['Học kỳ'])===term).sort((a,b)=>(Number(a['Thứ tự'])||0)-(Number(b['Thứ tự'])||0));
  const ownScores=scores.filter(s=>String(s['Mã nhân sự'])===String(studentId)&&String(s['Môn học'])===subject&&String(s['Học kỳ'])===term);
  const ownSummary=summary.filter(x=>String(x['Mã nhân sự'])===String(studentId)&&String(x['Môn học'])===subject&&String(x['Học kỳ'])===term);
  const scoreMap={};ownScores.forEach(s=>scoreMap[String(s['Mã đầu điểm'])]=s);
  const peopleOptions=employees.map(e=>({value:e['Mã nhân sự'],label:(e['Họ và tên']||e['Mã nhân sự'])+' · '+e['Mã nhân sự']}));
  const componentOptions=comps.map(c=>({value:c['Mã đầu điểm'],label:c['Tên đầu điểm']+' ('+c['Mã công thức']+')'}));
  const summaryCard=ownSummary[0];
  const published=ownScores.length>0&&ownScores.every(s=>s['Trạng thái công bố']==='Đã công bố');
  let html=`<div class="grid grid-3" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px"><div class="panel" style="padding:16px"><small class="muted">Điểm tổng kết thang 10</small><div style="font-size:30px;font-weight:800;margin-top:6px">${summaryCard&&summaryCard['Điểm tổng kết']!==''?Number(summaryCard['Điểm tổng kết']).toFixed(2):'—'}</div></div><div class="panel" style="padding:16px"><small class="muted">Đầu điểm đã nhập</small><div style="font-size:30px;font-weight:800;margin-top:6px">${summaryCard?summaryCard['Số đầu điểm đã có']:0}/${summaryCard?summaryCard['Tổng đầu điểm']:comps.length}</div></div><div class="panel" style="padding:16px"><small class="muted">Trạng thái</small><div style="font-size:18px;font-weight:700;margin-top:12px">${canManage?(published?'Đã công bố':'Bản nháp'): (published?'Đã công bố':'Chưa công bố')}</div></div></div>`;
  html+=`<div class="panel" style="padding:16px;margin-bottom:16px"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;align-items:end"><label class="form-group"><span>Học sinh</span>${canManage?learningGradeSelect('lg-student',peopleOptions,studentId,'Chọn học sinh'):`<div class="form-control" style="padding:10px">${escapeHtml(data.me?.name||'Tài khoản của tôi')}</div>`}</label><label class="form-group"><span>Môn học</span>${learningGradeSelect('lg-subject',subjects.map(x=>({value:x,label:x})),subject,'Chọn môn học')}</label><label class="form-group"><span>Học kỳ</span>${learningGradeSelect('lg-term',terms.map(x=>({value:x,label:x})),term,'Chọn học kỳ')}</label><button class="btn" data-action="learning-grades-refresh"><span class="material-symbols-rounded">sync</span>Cập nhật</button></div></div>`;
  if(canManage){
    html+=`<div class="panel" style="padding:18px;margin-bottom:16px"><h3 style="margin:0 0 12px">Thiết lập đầu điểm</h3><p class="muted" style="font-size:12px">Tạo các cột điểm như thường xuyên, giữa kỳ, cuối kỳ. Trọng số dùng cho cách tính mặc định khi chưa có công thức riêng.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px"><label class="form-group"><span>Môn học</span><input id="lg-new-subject" class="form-control" value="${escapeAttr(subject)}" placeholder="Ví dụ: Toán"></label><label class="form-group"><span>Học kỳ</span><input id="lg-new-term" class="form-control" value="${escapeAttr(term)}" placeholder="Học kỳ 1"></label><label class="form-group"><span>Tên đầu điểm</span><input id="lg-new-name" class="form-control" placeholder="Ví dụ: Giữa kỳ"></label><label class="form-group"><span>Mã công thức</span><input id="lg-new-code" class="form-control" placeholder="GK"></label><label class="form-group"><span>Điểm tối đa</span><input id="lg-new-max" class="form-control" type="number" min="0.1" step="0.1" value="10"></label><label class="form-group"><span>Trọng số (%)</span><input id="lg-new-weight" class="form-control" type="number" min="0" max="100" value="30"></label></div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn btn-primary" data-action="learning-grade-component-save"><span class="material-symbols-rounded">add</span>Thêm đầu điểm</button></div><div style="margin-top:12px;overflow:auto"><table class="data-table" style="width:100%"><thead><tr><th>Đầu điểm</th><th>Mã</th><th>Điểm tối đa</th><th>Trọng số</th></tr></thead><tbody>${comps.map(c=>`<tr><td>${escapeHtml(c['Tên đầu điểm'])}</td><td><code>${escapeHtml(c['Mã công thức'])}</code></td><td>${escapeHtml(c['Điểm tối đa'])}</td><td>${escapeHtml(c['Trọng số (%)'])}%</td></tr>`).join('')||'<tr><td colspan="4">Chưa có đầu điểm cho môn/học kỳ này.</td></tr>'}</tbody></table></div></div>`;
    html+=`<div class="panel" style="padding:18px;margin-bottom:16px"><h3 style="margin:0 0 8px">Thiết kế công thức tính điểm</h3><p class="muted" style="font-size:12px">Mỗi mã đầu điểm đại diện cho điểm đã quy đổi về thang 10. Ví dụ: <code>TX1*0.2 + GK*0.3 + CK*0.5</code>. Hỗ trợ +, -, *, / và dấu ngoặc; không chạy mã JavaScript.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px"><label class="form-group"><span>Tên công thức</span><input id="lg-formula-name" class="form-control" value="${escapeAttr((data.formulas||[]).find(f=>f['Môn học']===subject&&f['Học kỳ']===term)?.['Tên công thức']||'Công thức tổng kết')}" /></label><label class="form-group" style="grid-column:span 2"><span>Biểu thức</span><input id="lg-formula-expression" class="form-control" value="${escapeAttr((data.formulas||[]).find(f=>f['Môn học']===subject&&f['Học kỳ']===term)?.['Biểu thức']||'')}" placeholder="TX1*0.2 + GK*0.3 + CK*0.5"></label></div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn btn-primary" data-action="learning-grade-formula-save"><span class="material-symbols-rounded">functions</span>Lưu công thức</button></div></div>`;
    html+=`<div class="panel" style="padding:18px;margin-bottom:16px"><h3 style="margin:0 0 12px">Nhập điểm cho từng học sinh</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px"><label class="form-group"><span>Học sinh</span>${learningGradeSelect('lg-entry-student',peopleOptions,studentId,'Chọn học sinh')}</label><label class="form-group"><span>Đầu điểm</span>${learningGradeSelect('lg-entry-component',componentOptions,componentOptions[0]?.value||'','Chọn đầu điểm')}</label><label class="form-group"><span>Điểm đạt</span><input id="lg-entry-score" class="form-control" type="number" min="0" step="0.1" placeholder="Nhập điểm"></label><label class="form-group"><span>Nhận xét</span><input id="lg-entry-comment" class="form-control" placeholder="Nhận xét (không bắt buộc)"></label></div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn btn-primary" data-action="learning-grade-score-save"><span class="material-symbols-rounded">save</span>Lưu điểm</button></div><div style="margin-top:12px;overflow:auto"><table class="data-table" style="width:100%"><thead><tr><th>Đầu điểm</th><th>Điểm</th><th>Nhận xét</th><th>Trạng thái</th></tr></thead><tbody>${comps.map(c=>{const sc=scoreMap[String(c['Mã đầu điểm'])];return `<tr><td>${escapeHtml(c['Tên đầu điểm'])}</td><td>${sc?escapeHtml(sc['Điểm đạt']):'—'} / ${escapeHtml(c['Điểm tối đa'])}</td><td>${escapeHtml(sc?.['Nhận xét']||'')}</td><td>${sc?escapeHtml(sc['Trạng thái công bố']):'Chưa nhập'}</td></tr>`;}).join('')||'<tr><td colspan="4">Chưa có dữ liệu.</td></tr>'}</tbody></table></div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn btn-primary" data-action="learning-grade-publish" ${ownScores.length?'':'disabled'}><span class="material-symbols-rounded">campaign</span>Công bố điểm cho học sinh này</button></div></div>`;
  } else {
    html+=`<div class="panel" style="padding:18px"><h3 style="margin:0 0 12px">Bảng điểm của tôi</h3><p class="muted" style="font-size:12px">Chỉ những điểm đã được Quản trị/Quản lý công bố mới xuất hiện tại đây.</p><div style="overflow:auto"><table class="data-table" style="width:100%"><thead><tr><th>Đầu điểm</th><th>Điểm đạt</th><th>Điểm tối đa</th><th>Nhận xét</th></tr></thead><tbody>${comps.map(c=>{const sc=scoreMap[String(c['Mã đầu điểm'])];return sc?`<tr><td>${escapeHtml(c['Tên đầu điểm'])}</td><td><strong>${escapeHtml(sc['Điểm đạt'])}</strong></td><td>${escapeHtml(c['Điểm tối đa'])}</td><td>${escapeHtml(sc['Nhận xét']||'')}</td></tr>`:'';}).join('')||'<tr><td colspan="4">Chưa có điểm được công bố cho môn học/học kỳ này.</td></tr>'}</tbody></table></div><p class="muted" style="margin-top:12px">Cách tính: ${escapeHtml(summaryCard?.['Cách tính']||'Chưa có công thức')}</p></div>`;
  }
  if(canManage){html+=`<div class="panel" style="padding:18px;margin-top:16px"><h3 style="margin:0 0 12px">Tổng hợp kết quả trong phạm vi quản lý</h3><div style="overflow:auto"><table class="data-table" style="width:100%"><thead><tr><th>Học sinh</th><th>Nhóm</th><th>Môn học</th><th>Học kỳ</th><th>Điểm tổng kết</th><th>Tiến độ</th><th>Trạng thái</th></tr></thead><tbody>${summary.filter(x=>String(x['Môn học'])===subject&&String(x['Học kỳ'])===term).map(x=>`<tr><td>${escapeHtml(x['Họ và tên'])}</td><td>${escapeHtml(x['Nhóm']||'')}</td><td>${escapeHtml(x['Môn học'])}</td><td>${escapeHtml(x['Học kỳ'])}</td><td><strong>${x['Điểm tổng kết']===''?'—':Number(x['Điểm tổng kết']).toFixed(2)}</strong></td><td>${x['Tiến độ nhập']}%</td><td>${escapeHtml(x['Trạng thái công bố'])}</td></tr>`).join('')||'<tr><td colspan="7">Chưa có dữ liệu tổng hợp.</td></tr>'}</tbody></table></div></div>`;}
  root.innerHTML=html;
  const bind=(id,stateKey)=>{const el=document.getElementById(id);if(el)el.addEventListener('change',()=>{APP.state[stateKey]=el.value;renderLearningGradesContent(APP.state.learningGradesData||{});});};
  if(canManage){bind('lg-student','learningGradesSelectedEmployee');bind('lg-subject','learningGradesSelectedSubject');bind('lg-term','learningGradesSelectedTerm');bind('lg-entry-student','learningGradesSelectedEmployee');}
  else {bind('lg-subject','learningGradesSelectedSubject');bind('lg-term','learningGradesSelectedTerm');}
}
async function saveLearningGradeComponentUi(){const payload={subject:document.getElementById('lg-new-subject')?.value,term:document.getElementById('lg-new-term')?.value,name:document.getElementById('lg-new-name')?.value,code:document.getElementById('lg-new-code')?.value,maxScore:document.getElementById('lg-new-max')?.value,weight:document.getElementById('lg-new-weight')?.value};try{const r=await gas('saveLearningGradeComponent',payload,APP.token,{timeout:60000});APP.state.learningGradesData=r.data;APP.state.learningGradesSelectedSubject=payload.subject;APP.state.learningGradesSelectedTerm=payload.term;renderLearningGradesContent(r.data);showToast('Đã thêm đầu điểm','Cấu hình đầu điểm đã được lưu.','success');}catch(e){showToast('Không thể lưu đầu điểm',e.message,'error');}}
async function saveLearningGradeFormulaUi(){const payload={subject:APP.state.learningGradesSelectedSubject||document.getElementById('lg-new-subject')?.value,term:APP.state.learningGradesSelectedTerm||document.getElementById('lg-new-term')?.value,name:document.getElementById('lg-formula-name')?.value,expression:document.getElementById('lg-formula-expression')?.value};try{const r=await gas('saveLearningGradeFormula',payload,APP.token,{timeout:60000});APP.state.learningGradesData=r.data;renderLearningGradesContent(r.data);showToast('Đã lưu công thức','Công thức tính điểm đã được cập nhật.','success');}catch(e){showToast('Công thức chưa hợp lệ',e.message,'error');}}
async function saveLearningGradeScoreUi(){const payload={employeeId:document.getElementById('lg-entry-student')?.value||APP.state.learningGradesSelectedEmployee,componentId:document.getElementById('lg-entry-component')?.value,score:document.getElementById('lg-entry-score')?.value,comment:document.getElementById('lg-entry-comment')?.value};try{const r=await gas('saveLearningGradeScore',payload,APP.token,{timeout:60000});APP.state.learningGradesData=r.data;APP.state.learningGradesSelectedEmployee=payload.employeeId;renderLearningGradesContent(r.data);showToast('Đã lưu điểm','Điểm đang ở trạng thái bản nháp, chưa hiển thị với học sinh.','success');}catch(e){showToast('Không thể lưu điểm',e.message,'error');}}
async function publishLearningGradesUi(){const payload={employeeId:APP.state.learningGradesSelectedEmployee,subject:APP.state.learningGradesSelectedSubject,term:APP.state.learningGradesSelectedTerm};if(!confirm('Công bố toàn bộ đầu điểm hiện có của học sinh này? Học sinh sẽ nhìn thấy điểm trong tài khoản cá nhân.'))return;try{const r=await gas('publishLearningGrades',payload,APP.token,{timeout:60000});APP.state.learningGradesData=r.data;renderLearningGradesContent(r.data);showToast('Đã công bố điểm','Học sinh có thể xem điểm trong tài khoản của mình.','success');}catch(e){showToast('Không thể công bố điểm',e.message,'error');}}

</script>
