# TOKYO SHIBUYA DEV FOR TYPESCRIPT
---

TOKYO SHIBUYA DEVはホームページ手作り用キットです。<br>
完全に個人目線で開発をしていますが、ありきたりな構成ではあるので、cloneしてくればだれでもすぐに開発が始められるでしょう。

## 構成

### node

* >= 7.0.0

他でも動くと思うけど、動作してるのは7.5.0

### パッケージマネージャ

* yarn

入っていれば`yarn`で、なければhomebrewなりでyarnを落としてくるか、`npm i`でも叩きましょう。おそらくそれでも入ってくると思います。

### タスクランナーなどの構成

* gulp
  * pug -- htmlをどうこうするのに
  * gulp-file-include -- pug使わないときのために一応置いてる。
  * sass(scssでない)
  * pleeease -- cssをいい感じに
  * webpack3 -- jsをどうこうするのに
  * imagemin -- 画像圧縮
  * browser-sync -- ローカルホスト立ち上げ用
  * typescript

大まかには以上で、詳しいことはpackage.jsonで

### 元から入れてるプラグイン

**css**
* TOKYO SHIBUYA RESET -- 僕が作った全消しリセット

**js**
* jquery -- どこでも使えるようにしてある
* modernizr -- touch eventだけ
* gsap
* imagesloaded
* webfontloader

## コマンド

開発タスク -- watch

    $ yarn start

開発タスク -- 吐き出しだけ

    $ yarn run build

tslint

    $ yarn run lint

リリースタスク

    $ yarn run release

リリースされたものの確認

    $ yarn run server

## 詳細

### ディレクトリとファイル

ディレクトリは以下

    app -- _release リリースフォルダ
      |  ├ dest ステージング
      |  ├ src 開発
      |     ├ assets
      |       ├ js
      |       ├ img
      |       ├ sass
      |         ├ lib
      |           ├ modules...
      |
    package.json ...

ディレクトリはpackage.jsonとどう階層においてあるDirectoryManager.jsをgulpfileとwebpack configで使っています。<br>
それぞれ、pathの書き方が違うので、そこを柔軟にするために関数化して、必要なら引数を食わせることにしました。  
ディレクトリ構成を変更する場合はそこも確認してみてください。

### webpackとbabelとeslint

**webpack configについて**

現在主流なのはwebpack configをcommmon/dev/prodの3枚とかに分けることだとおもうのですが、今回は対して違いがないので、全て1枚のファイルにまとめています。そしてオブジェクトにぶら下げてわたすことで、gulpで読み込むときにどの設定を読み込むかを分けています。
現状2パターンあります。(dev/prod)

**tslint**

airbnbのものを使ってますがところどころ上書きしてます。

### PEACE
