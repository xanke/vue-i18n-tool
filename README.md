# vue-i18n-tool
vue 多语言自动生成工具

轻松对 Vue 组件进行国际化处理，自动生成多语言配置文件，并通过百度翻译进行自动翻译

### DEMO

```bash
cd ./sample
node ./scripts/i18n.js
```

### 配置参考

#### basePath

- Type: `string`
- Default: `./`

项目目录

#### filePaths

- Type: `Array<string>`
- Default: `[]`

具体需要翻译的目录，为空遍历全部

#### skipFiles

- Type: `Array<string>`
- Default: `[]`

需要忽略翻译的文件

### from

- Type: `string`
- Default: `zh`

原始语言

### from

- Type: `string`
- Default: `eh`

目标语言

查看支持的语种：https://api.fanyi.baidu.com/doc/21

### 生成格式

处理前
```vue
<template>
  <div class="hello">
    <h3>基本</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">核心文件</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">论坛</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">社区聊天</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">新闻</a></li>
    </ul>
  </div>
</template>
```

处理后
```vue
<template>
  <div class="hello">
    <h3>{{$t('components__HelloWorld.4092ed')}}</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">{{$t('components__HelloWorld.c86fba')}}</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">{{$t('components__HelloWorld.a5f625')}}</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">{{$t('components__HelloWorld.6f459b')}}</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">{{$t('components__HelloWorld.1d9c15')}}</a></li>
    </ul>
  </div>
</template>
```

en.json
```json
{
	"components__HelloWorld": {
		"170227": "ecosystem",
		"45c32e": "For guidance and methods on how to configure / customize this project,",
		"7e4042": "Please check",
		"9a9a08": "Vue cli document",
		"e4bb40": "Installed cli plug ins",
		"4092ed": "basic",
		"c86fba": "Core document",
		"a5f625": "forum",
		"6f459b": "Community chat",
		"1d9c15": "Journalism"
	}
}
```

zh.json
```json
{
	"components__HelloWorld": {
		"170227": "生态系统",
		"45c32e": "有关如何配置/自定义此项目的指南和方法，",
		"7e4042": "请查看",
		"9a9a08": "vue-cli 文档",
		"e4bb40": "已安装的CLI插件",
		"4092ed": "基本",
		"c86fba": "核心文件",
		"a5f625": "论坛",
		"6f459b": "社区聊天",
		"1d9c15": "新闻"
	}
}
```

settings.json
```json
{
	"components__HelloWorld": [
		{
			"key": "170227",
			"content": "生态系统",
			"baidu_en": "ecosystem"
		},
		{
			"key": "45c32e",
			"content": "有关如何配置/自定义此项目的指南和方法，",
			"baidu_en": "For guidance and methods on how to configure / customize this project,"
		},
		{
			"key": "7e4042",
			"content": "请查看",
			"baidu_en": "Please check"
		},
		{
			"key": "9a9a08",
			"content": "vue-cli 文档",
			"baidu_en": "Vue cli document"
		},
		{
			"key": "e4bb40",
			"content": "已安装的CLI插件",
			"baidu_en": "Installed cli plug ins"
		},
		{
			"key": "4092ed",
			"content": "基本",
			"baidu_en": "basic"
		},
		{
			"key": "c86fba",
			"content": "核心文件",
			"baidu_en": "Core document"
		},
		{
			"key": "a5f625",
			"content": "论坛",
			"baidu_en": "forum"
		},
		{
			"key": "6f459b",
			"content": "社区聊天",
			"baidu_en": "Community chat"
		},
		{
			"key": "1d9c15",
			"content": "新闻",
			"baidu_en": "Journalism"
		}
	]
}
```