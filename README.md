# http2-serve

基于 [serve-handle](https://github.com/zeit/serve-handler) 的简单的 http1.1/https/http2 web server，需要用到 https 或者 http2 的 demo 可以直接用这个，如果是只用到 http1.1 建议直接使用 [serve](https://github.com/zeit/serve)。
证书是直接创建的，属于不被信任证书，浏览器会警告，需要手动跳过警告。

当然 http2 必须是 https。

## 安装

```sh
npm install -g http2-serve
```

## 使用

当前目录运行下面的命令，当前目录为 web 服务根目录。

`http2-sever -h` 列出命令介绍。

- `-2`
  使用 http2。
- `-s`
  使用 https。

```sh
http2-serve -2
```
