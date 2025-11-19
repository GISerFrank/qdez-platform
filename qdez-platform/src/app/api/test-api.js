/**
 * QDEZ 邀请码功能 - API 测试脚本
 * 
 * 使用方法:
 * 1. 启动开发服务器: pnpm dev
 * 2. 打开浏览器访问: http://localhost:3000
 * 3. 打开控制台 (F12)
 * 4. 复制粘贴这个脚本到控制台
 * 5. 调用测试函数
 */

const API_BASE = 'http://localhost:3000/api';

// ============================================
// 测试工具函数
// ============================================

async function apiRequest(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(`✅ ${method} ${url}`);
    console.log('Status:', response.status);
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error(`❌ ${method} ${url}`);
    console.error('Error:', error);
    return null;
  }
}

// ============================================
// 1. 测试邀请码验证
// ============================================

async function testValidateInviteCode(code = 'QDEZ-2025-5JMQ3Z') {
  console.log('\n🧪 测试1: 邀请码验证\n');
  return await apiRequest(
    `${API_BASE}/invite-codes/validate`,
    'POST',
    { code }
  );
}

// 测试无效邀请码
async function testInvalidInviteCode() {
  console.log('\n🧪 测试2: 无效邀请码\n');
  return await apiRequest(
    `${API_BASE}/invite-codes/validate`,
    'POST',
    { code: 'INVALID-CODE' }
  );
}

// ============================================
// 2. 测试用户名检查
// ============================================

async function testCheckUsername(username = 'zhangsan') {
  console.log('\n🧪 测试3: 用户名可用性检查\n');
  return await apiRequest(
    `${API_BASE}/auth/check-availability`,
    'POST',
    { username }
  );
}

// ============================================
// 3. 测试邮箱检查
// ============================================

async function testCheckEmail(email = 'zhangsan@example.com') {
  console.log('\n🧪 测试4: 邮箱可用性检查\n');
  return await apiRequest(
    `${API_BASE}/auth/check-availability`,
    'POST',
    { email }
  );
}

// ============================================
// 4. 测试完整注册流程
// ============================================

async function testCompleteRegistration() {
  console.log('\n🧪 测试5: 完整注册流程\n');
  
  // 生成随机用户名避免冲突
  const timestamp = Date.now();
  const randomUsername = `testuser`;
  const randomEmail = `test${timestamp}@example.com`;
  
  const registrationData = {
    // Step 1: 基础账号
    email: randomEmail,
    username: randomUsername,
    password: 'Password123',
    confirmPassword: 'Password123',
    inviteCode: 'QDEZ-2025-5JMQ3Z', // 请替换为您的真实邀请码
    
    // Step 2: 二中身份
    name: '测试用户',
    qdezEnrollmentYear: 2018,
    qdezGraduationYear: 2021,
    qdezClass: '高三3班',
    
    // Step 3: 留学信息
    country: '美国',
    city: '波士顿',
    currentSchool: 'MIT',
    major: '计算机科学',
    degree: '本科',
    enrollmentYear: 2021,
    expectedGradYear: 2025,
    
    // Step 4: 完善资料
    displayName: '测试用户 | MIT CS',
    bio: '这是一个测试账号',
    wechat: 'test_wechat',
    linkedin: 'https://linkedin.com/in/testuser',
    website: 'https://testuser.com',
    privacySettings: {
      profilePublic: true,
      locationPublic: true,
      contactPublic: false,
      searchable: true,
    },
  };
  
  return await apiRequest(
    `${API_BASE}/auth/register`,
    'POST',
    registrationData
  );
}

// ============================================
// 5. 测试注册验证（缺少必填字段）
// ============================================

async function testRegistrationValidation() {
  console.log('\n🧪 测试6: 注册数据验证（故意遗漏字段）\n');
  
  const incompleteData = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'short', // 太短的密码
    confirmPassword: 'different', // 不一致的密码
    inviteCode: 'QDEZ-2025-5JMQ3Z',
  };
  
  return await apiRequest(
    `${API_BASE}/auth/register`,
    'POST',
    incompleteData
  );
}

// ============================================
// 6. 运行所有测试
// ============================================

async function runAllTests() {
  console.log('🚀 开始运行所有测试...\n');
  console.log('='.repeat(60));
  
  // 测试1: 有效邀请码
  await testValidateInviteCode();
  await new Promise(r => setTimeout(r, 500));
  
  // 测试2: 无效邀请码
  await testInvalidInviteCode();
  await new Promise(r => setTimeout(r, 500));
  
  // 测试3: 用户名检查
  await testCheckUsername('zhangsan');
  await new Promise(r => setTimeout(r, 500));
  
  // 测试4: 邮箱检查
  await testCheckEmail('test@example.com');
  await new Promise(r => setTimeout(r, 500));
  
  // 测试5: 数据验证
  await testRegistrationValidation();
  await new Promise(r => setTimeout(r, 500));
  
  // 测试6: 完整注册（最后运行，因为会消耗邀请码）
  console.log('\n⚠️  即将测试完整注册流程，这将消耗一个邀请码使用次数');
  console.log('如果不想测试，请跳过这一步\n');
  // await testCompleteRegistration();
  
  console.log('\n='.repeat(60));
  console.log('✅ 所有测试完成！\n');
  console.log('💡 提示: 如果要测试完整注册，请运行: testCompleteRegistration()');
}

// ============================================
// 使用说明
// ============================================

console.log(`
╔════════════════════════════════════════════════════════════╗
║         QDEZ 邀请码功能 - API 测试脚本                    ║
╚════════════════════════════════════════════════════════════╝

📝 可用的测试函数:

1. testValidateInviteCode('邀请码')     - 测试邀请码验证
2. testInvalidInviteCode()              - 测试无效邀请码
3. testCheckUsername('用户名')          - 测试用户名检查
4. testCheckEmail('邮箱')               - 测试邮箱检查
5. testCompleteRegistration()           - 测试完整注册
6. testRegistrationValidation()         - 测试数据验证
7. runAllTests()                        - 运行所有测试

💡 快速开始:
   runAllTests()  - 运行所有测试（不包括完整注册）

📖 示例:
   testValidateInviteCode('QDEZ-2025-BOSTON3K')
   testCheckUsername('zhangsan')
   testCompleteRegistration()
`);
