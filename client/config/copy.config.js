module.exports = {
  copySettings: {
    src: ['{{ROOT}}/config.json'],
    dest: '{{WWW}}/'
  },
	copyExampleSettings: {
    src: ['{{ROOT}}/config.example.json'],
    dest: '{{WWW}}/'
  }
}