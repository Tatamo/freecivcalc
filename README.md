# FreecivCalc2

Freeciv battle calculator

<http://tatamo.81.la/freecivcalc2/>

## Install

Requirements: git, npm

```bash
$ git clone https://github.com/Tatamo/freecivcalc2.git
$ cd freecivcalc2
$ npm install
$ npm run build
```

`dist/` is generated on working directory.
Upload all files in to a directory on your server.
If you would like to run it locally, you should run it on a local server. This is due to the fact that Chrome bans loading of local files from its Same-Origin policy.
For example, if you have Python installed:

```bash
$ cd dist
$ python -m SimpleHTTPServer
```
Then, go <http://localhost:8000/>.

---
前提: git, npm

```bash
$ git clone https://github.com/Tatamo/freecivcalc2.git
$ cd freecivcalc2
$ npm install
$ npm run build
```

distディレクトリが生成され、その下に必要なファイルがすべて配置されます。
これらのファイルをサーバー上にアップロードしてください。
ChromeはSame-Origin Policyがローカルファイルにも適用されるため、ローカルファイルでの実行では動作しません。
たとえばpythonがインストールされている場合、以下のようにして動作確認が可能です。

```bash
$ cd dist
$ python -m SimpleHTTPServer
```
コマンドを実行し、 <http://localhost:8000/> にアクセスしてください。

## Usage

Select both attacker and defender units, set conditions, and click Calc button. 
The Probability of winning would be shown.

---
ユニットを選択し、条件を設定して計算ボタンを押すと戦闘勝率が表示されます。

## Language Support / Add New Language

(The translation for the English language is still incomplete. Contribution to translations is highly appreciated.)

Japanese and English are currently supported.
To add a new language, you have to make the following two files:
- `src/template/index_*.json` descripts FreecivCalc2's UI in each language
- `data/freecivcalc_*.json` FreecivCalc2 dataset file that descripts ruleset and data in each language (refer "Dataset" section below)

For now, new language files cannot be added automatically. If you would like to contribute other language files, please get in touch.

---
(現在、日本語から英語への翻訳の質もあまり高くありません。翻訳の改善に協力していただけると非常に助かります)

現在、日本語と英語がサポートされています。
新しい言語を追加される場合、その言語に翻訳した次の2つのファイルを作成する必要があります。
- `src/template/index_*.json` FreecivCalc2のインターフェース部分の言語ファイル
- `data/freecivcalc_*.json` ルールセットを記述したFreecivCalc2のデータセットファイル

現時点では新しい言語ファイルは手動で追加する必要があるため、新しい言語に対応したファイルを作成された場合は作者にお知らせください。

## Dataset

Dataset is JSON file that descripts the rule of battle.
It is similar to Freeciv's ruleset but has its own notation.
Dataset file contains the following structure:

データセットは戦闘のルールを記述したJSON形式のファイルです。
これはFreecivのルールセットに似ていますが、独自の記述形式を持っています。
データセットは以下のような構造を持っています。
```
{
	"meta",
	"units",
	"unitclass",
	"veteranlevel",
	"terrains",
	"flags",
	"adjustments"
}
```

### meta
Describes information related to the dataset file itself.

データセットファイルそのものに関連した情報を記述します。
```
"meta": {
	"name": string,
	"language": string,
	"ruleset": string,
	"freeciv_version": string
}
```

- name
  * name of dataset
  * データセットの名前
- language
  * dataset language
  * データセットの使用言語
- ruleset
  * The name of the ruleset on which the dataset is based
  * データセットの元となるルールセットの名前
- freeciv_version
  * The version of Freeciv a ruleset is compatible with
  * 元となるルールセットが対応しているFreecivのバージョン

### units
```
"units": [{
	"id": string
	"label": string
	"label_detail": string
	"phonetics": [string],
	"class": string,
	"flags": [string],
	"hp": number,
	"attack": number,
	"defence": number,
	"firepower": number
},...]
```

- id
  * id of the unit. must be unique
  * ユニットのid。他のユニットと重複しない一意なものである必要があります
- label
  * unit name displayed on FreecivCalc2
  * 画面上で表示されるユニットの名前
- label_detail
  * The unit name in more detail. Usually it can just be "unitname_in_other_language(unitname_in_english)", so it can be the same as label when written for English
  * より詳細なユニットの名前。 普通「ユニット名(英語名)」となるので、英語用のデータセットではlabelと同じで問題ないと思われます
- phonetics
  * array of the phonetics of the unit's name to search unit to input its name in combobox on FreecivCalc2. in English, it may be ["same_as_label"] or [(empty)]
  * ユニットの発音を列挙した配列。ユニット選択画面でユニット名を入力した際の候補列挙のために使用します。日本語などの一部の言語を除く言語では、labelと同じ文字列のみを追加するか、全く空の配列で問題ないと思われます
- class
  * the id of unitclass the unit has. it need to be same as any of id of unitclass that is defined later
  * そのユニットが持つユニットクラス。後述のunitclassで定義されるいずれかのクラスのidと同じ文字列である必要があります
- flags
  * array of flags the unit has. it would be used in adjustments section later. e.g. "pikemen" and "mounted" flag to describe pikemen specific combat bonuses
  * ユニットが持つフラグを列挙した配列。長槍兵と騎乗ユニットの戦闘補正のような特殊な補正のために使用します。どのような文字列をフラグに使用することもできますが、後のadjustmentsでこのflagを使用します
- hp, attack, defence, firepower
  * the stats of the unit
  * そのユニットの持つそれぞれのステータス

### unitclass
```
"unitclass": [{
	"id": string,
	"label": string
},...]
```

- id
  * id of the unitclass. must be unique. unit.class has to same as one of unitclass.id
  * ユニットクラスのid。重複しない一意なものである必要があります。unit.classはいずれかのunitclassのidと一致していなければいけません
- label
  * unitclass name displayed on FreecivCalc2
  * 画面上で表示されるユニットクラスの名前

### veteranlevel
```
"veteranlevel":  [{
	"level": number
	"id": string,
	"label": string,
	"value": number,
	"chance_for_promotion": number
},...]
```

- level
  * level of veteran. it must start at 1 and increase one by one
  * ベテランレベル。1から始まり、連続した数値でなければいけません
- id
  * id of the veteranlevel. must be unique
  * ベテランレベルのid。重複しない一意なものである必要があります
- label
  * veteranlevel displayed on FreecivCalc2. it would be ok to describe the modification value the unit gains at the same time
  * 画面上で表示されるベテランレベル。補正値も記述しておくとよいでしょう
- value
  * the value of modification the unit gain (%)
  * ユニットが補正を受ける数値。単位は%
- chance_for_promotion
  * the probability that the unit will be promoted after battle (currently not implemented)
  * 戦闘後にユニットが昇進する確率(現在この項目に関連した機能は未実装です)

### terrains
```
"terrains": [{
	"id": string,
	"label": string,
	"value": number
},...]
```
- id
  * id of the terrain. must be unique
  * 地形のid。重複しない一意なものである必要があります
- label
  * terrain name displayed on FreecivCalc2. it would be ok to descript the modification value the unit gains at the same time
  * 画面上で表示されるベテランレベル。補正値も記述しておくとよいでしょう
- value
  * the value of modification the unit gain (%)
  * ユニットが補正を受ける数値。単位は%

### flags
Flag gives checkbox that users can click. To calculate with adjustments, you can get the information that each of flags is checked or not.

flagはユーザーがチェックを入れることのできる項目を提供します。この情報は種々の戦闘の補正を実現するために使用されます。
```
"flags": {
	"basic": [flag[id="in-city"], flag[id="defender-fortified"]],
	"structure": [flag,...],
	"roads": [flag,...],
	"bases": [flag,...],
	"ex": [flag,...]
}
```
Flags have 5 sections. Each sections are an array of same format flag, but where the flag displayed on FreecivCalc2 is different.

flagsは5つのセクションに別れており、これらは同じflagのフォーマットを使用しますが、FreecivCalc2上で表示される場所が異なります。
- basic
  * the flag's id can only be "in-city" or "defender-fortified"
  * このセクションのflagの持つidは"in-city"と"defender-fortified"だけであるように決められています
- structure
  * the flag's in this section express defence structure of city
  * このセクションのflagは都市の防御施設を表現します
- roads
  * the flags in this section adds calculations for objects around terrains like rivers or roads
  * このセクションのflagは道や川のような、地形に関連した補正情報を表現します
- bases
  * the flags in this section express structures out of city e.g. fortress. what is different from the roads section is that the flag's checkbox can only be clicked on when the unit is out of city on FreecivCalc2
  * このセクションのflagは要塞のような、都市外の建造物の情報を表現します。roadsとの違いは、この補正を受けるユニットが常に都市の外にいる(かのようにFreecivCalc2上で表示される)ことです
- ex
  * if you want to express more specific modifications, you can add flags to this section
  * 以上のいずれのセクションにも適さない補正を表現するために用います

```
flag : {
	"id": string,
	"label": string,
	"description"?: string
}
```
- id
  * id of the flag. must be unique. it would be used in adjustments section later
  * フラグのid。重複しない一意なものである必要があります。補正の条件式の記述にこのid名が使用されます
- label
  * flag information displayed on FreecivCalc2. it would be ok to describe the modification value the unit gains at the same time
  * 画面上で表示されるフラグの情報。補正値も記述しておくとよいでしょう
- description
  * optional. if description is defined, move mouse cursor on the flag label on FreecivCalc2 to show this description in tooltip
  * descriptionは定義しなくても不正ではありません。descriptionが定義されている場合、FreecivCalc2でフラグをオンマウスするとdescriptionの内容が表示されます

### adjustments
```
"adjustments": [{
	"id": string,
	"label": string,
	"condition": condition_statement,
	"effect": [{
		"type": string,
		"value": string
	},...]
},...]
```
- id
  * id of the adjustment. must be unique
  * フラグのid。重複しない一意なものである必要があります
- label
  * adjustment information displayed on FreecivCalc2 detailed results tab
  * 詳細タブで表示される補正の情報
- condition
  * defines a conditional statement in FreecivCalc's own format. detailed information is explained later
  * 補正を適用するかどうかを決定するための条件式を記述します。後述する専用の記法を用います
- effect
  * array of what effects affect units when the adjustment is applied
  * 補正が適用された際に及ぼす効果を列挙した配列
  - type
    * the type of effect. the following 6 effects exist:
    * 補正の種類。以下の6種類が存在します
      - "attacker-strength-multiply"
			- "defender-strength-multiply"
			- "attacker-firepower-multiply"
			- "defender-firepower-multiply"
			- "attacker-firepower-set"
			- "defender-firepower-set"
	- value
	  * the value of effect. note that the type is not number, but string. this is why some functional formula can be used. the following 3 functions exist:
	  * 補正の値。"*-multiply" 系の補正の単位は%
	  - "attacker-veteran()"
	    * get the value of modification from attacker's veteranlevel
	    * 攻撃ユニットのベテランレベルによる補正値を取得します
	  - "defender-veteran()"
	    * get the value of modification from defender's veteranlevel
	    * 防御ユニットのベテランレベルによる補正値を取得します
	  - "terrain()"
	    * get the value of modification from terrain
	    * 地形による防御補正値を取得します

#### conditional notations
```
condition: ["AND"|"OR"|"NOT"|boolean|functional|condition[, boolean|function|condition]] ([string|condition])
boolean: "true"|"false" (string)
function: "func(arg)" (string)
```
- "AND"
  * optional. only used with the first element of condition array. when array's all the elements returns true, the condition returns true
  * 省略可能。 条件式配列の最初の要素にのみ指定できます。その条件式配列のすべての要素がtrueを返した場合にその条件式配列はtrueとなります
- "OR"  
  * only used with the first element of condition array. when at least one of elements in the condition array returns true, returns true
  * 条件式配列の最初の要素にのみ指定できます。その条件式配列のうちいずれか一つの要素でもtrueを返すなら、その条件式配列はtrueとなります
- "NOT"
  * only used with the first element of condition array. when the following element returns false, returns true. third and later uses would be all ignored
  * 条件式配列の最初の要素にのみ指定できます。二番目の要素がfalseを返す場合にその条件式配列はtrueとなります。三番目以降の要素は無視されます。
- "true","false"
  * express true or false. if an adjustment's condition is true, the adjustment effect would be enabled
  * trueもしくはfalseそのものの表現です。あるadjustmentの条件式配列がtrueとなるとき、その補正が適用されます
- function
  * get information of units and flags. the following 5 functions exist:
  * ユニットやフラグの持つ情報を取得できます。以下の5種類が存在します
  - "flag(arg)"
    * return true if the flag whose id eqals arg is checked, or false
    * argと等しいidを持つflagにチェックが入っているならtrueを、そうでないならfalseを返します
  - "attacker-class(arg)"
    * return true if the attacker unit's unitclass eqals arg, or false
    * 攻撃ユニットのクラスがargならtrueを、そうでないならfalseを返します
  - "defender-class(arg)"
    * return true if the defender unit's unitclass eqals arg, or false
    * 防御ユニットのクラスがargならtrueを、そうでないならfalseを返します
  - "attacker-flag(arg)"
    * return true if the attacker unit has flag eqals arg, or false
    * 攻撃ユニットがargと等しいユニットフラグを持つならtrueを、そうでないならfalseを返します
  - "defender-flag(arg)"
    * return true if the defender unit has flag eqals arg, or false
    * 防御ユニットのクラスがargと等しいユニットフラグを持つならtrueを、そうでないならfalseを返します
##### example

###### effect.value
```
"effect": [{
	"type": "defender-strength-multiply",
	"value": "150"
}]
```
This adjutment is applied, defender unit can gain 150% modification.
Note that `"value": 150` is invalid, you have to write `"value": "150"`.

```
"effect": [{
	"type": "defender-strength-multiply",
	"value": "defender-veteran()"
}]
```
On the other hand, this adjustment can get value from the value of defender's veteranlevel that is decided by user of FreecivCalc2.

###### condition
```
"condition": [["OR", "defender-class(sea)", "defender-class(trireme)"], "flag(in-city)"]
```
This is "Ship in city attacked" adjustment's condition.
This condition is translated into that:
```
( ( defender-class(sea) or defender-class(trireme) ) and flag(in-city) )
```
So defender unit's class is sea or trireme, and the flag in-city is true, this adjustment can be applied.


```
"condition": ["defender-class(land)", ["NOT", "flag(in-city)"], "flag(in-fortress)", "flag(river)"]
```
This is "Terrain (both river and fortress)" adjustment's condition.
This condition is translated into:
```
( defender-class(land) and ( not flag(in-city) ) and flag(in-fortress) and flag(river) )
```
If defender unit is land class unit, not in city, in fortress and on river, the adjustment affects.

## License

BSD-3-Clause

