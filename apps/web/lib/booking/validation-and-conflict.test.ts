import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidCitizenId, isValidEmail, isValidVietnamesePhone } from 'shared';

test('Phone validation accepts valid VN phone numbers and rejects invalid', () => {
  assert.equal(isValidVietnamesePhone('0912345678'), true);
  assert.equal(isValidVietnamesePhone('0381234567'), true);
  assert.equal(isValidVietnamesePhone('+84912345678'), true);
  assert.equal(isValidVietnamesePhone('0771234567'), true);

  assert.equal(isValidVietnamesePhone('123456'), false);
  assert.equal(isValidVietnamesePhone('0123456789'), false); // Đầu 01 cũ không còn dùng
  assert.equal(isValidVietnamesePhone('abc0912345678'), false);
  assert.equal(isValidVietnamesePhone(''), false);
});

test('Email validation checks format correctly', () => {
  assert.equal(isValidEmail('customer@example.com'), true);
  assert.equal(isValidEmail('nhut.thanh+travel@domain.vn'), true);

  assert.equal(isValidEmail('customer'), false);
  assert.equal(isValidEmail('customer@'), false);
  assert.equal(isValidEmail('customer@example'), false);
  assert.equal(isValidEmail(''), false);
});

test('CCCD / CMND validation checks 9 or 12 digits', () => {
  assert.equal(isValidCitizenId('079205001234'), true); // 12 số CCCD
  assert.equal(isValidCitizenId('012345678'), true); // 9 số CMND

  assert.equal(isValidCitizenId('12345'), false);
  assert.equal(isValidCitizenId('0792050012345'), false); // 13 số
  assert.equal(isValidCitizenId('07920500123A'), false); // chứa chữ cái
  assert.equal(isValidCitizenId(''), false);
});

test('Schedule conflict interval overlap math works for user example', () => {
  // Tour 1: 15 đến 20
  const s1 = '2026-11-15';
  const e1 = '2026-11-20';

  // Tour 2: 17 đến 25
  const s2 = '2026-11-17';
  const e2 = '2026-11-25';

  const isOverlap = (startA: string, endA: string, startB: string, endB: string) => {
    return startA <= endB && startB <= endA;
  };

  // Trùng nhau từ ngày 17 đến 20
  assert.equal(isOverlap(s1, e1, s2, e2), true);

  // Không trùng (Tour sau đó: 21 đến 25)
  assert.equal(isOverlap(s1, e1, '2026-11-21', '2026-11-25'), false);

  // Không trùng (Tour trước đó: 10 đến 14)
  assert.equal(isOverlap(s1, e1, '2026-11-10', '2026-11-14'), false);

  // Trùng ngày biên (10 đến 15)
  assert.equal(isOverlap(s1, e1, '2026-11-10', '2026-11-15'), true);
});

