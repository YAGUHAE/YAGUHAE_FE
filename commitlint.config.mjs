/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 허용 타입 (docs/git-convention.md 참고)
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'design',
        'refactor',
        'style',
        'docs',
        'test',
        'chore',
        'ci',
        'perf',
        'revert',
      ],
    ],
    // 제목은 한글을 쓰므로 대소문자 규칙은 끈다
    'subject-case': [0],
    'subject-full-stop': [2, 'never', '.'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [0],
  },
  // Merge / Revert 커밋은 검사에서 제외
  ignores: [
    (message) => /^Merge /.test(message),
    (message) => /^Revert /.test(message),
  ],
};

export default config;
