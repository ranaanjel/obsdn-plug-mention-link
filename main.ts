import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { parse as p } from "node-html-parser";
import {exec} from "child_process"
import {promisify} from "util"
import { Url } from 'url';

const execP = promisify(exec)

export default class MyPlugin extends Plugin {
	 imageURL :string ;
	async onload():Promise<void> {

		//console.log("this is first time from plugins")
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		//const statusBarItemEl = this.addStatusBarItem();
		//statusBarItemEl.setText('Status Bar Text');

		this.app.workspace.on("editor-paste", async (eObj, ed, info) => {

			eObj.preventDefault();

			let cpData = eObj.clipboardData ;
			
			let value:string = cpData?.getData("text");
			let pattern:RegExp = /(https|http)/;
			let n = Number(value?.length); 
			const cursorPosition = ed.getCursor()
			let cursorPosition2 = Object.assign({}, cursorPosition)
			cursorPosition2.ch = n;

			//console.log(pattern.test(value))

			if(!pattern.test(value)) {
				ed.replaceRange(value, cursorPosition)
				ed.setCursor(cursorPosition2)
				return "";
			}
			//console.log(ed.getCursor())

			let boilterValue = '[Auto Mentioning in a sec...]()' 
			let boilerLength = boilterValue.length
			
			cursorPosition2.ch = boilerLength; 

			ed.replaceRange(boilterValue, cursorPosition)
			
			//console.log(cursorPosition, cursorPosition2)	
			//ed.setSelection( cursorPosition, cursorPosition2)
		
			let tValue = 	await this.getTitle(value)
			//console.log(tValue)

			let replace = `[${tValue}](${value})`
			//cursorPosition2.ch = replace.length;

			//console.log(cursorPosition2)
			//ed.setCursor(cursorPosition2)

			//ed.replaceSelection(replace)
			//ed.replaceRange(replace, cursorPosition)
			//ed.setCursor(cursorPosition2)


			console.log(ed.getLine(cursorPosition2.line))
			let imgElement = document.createElement("img")
			imgElement.src = this.imageURL
			imgElement.setAttribute("width", "15")
			imgElement.setAttribute("height", "15")
			console.log(imgElement.outerHTML)
			
			let insertTitle = imgElement.outerHTML+" "+replace;

			ed.setLine(cursorPosition2.line, insertTitle)
			cursorPosition2.ch = insertTitle.length;
			ed.setCursor(cursorPosition2)

			//let setValue = ed.setSelection(cursorPosition2, cursorPosition);
			//ed.replaceRange("hello world", cursorPosition)			
			
			//console.log(cursorPosition,cursorPosition2,value)
			//https://publish-01.obsidian.md/access/caa27d6312fe5c26ebc657cc609543be/favicon-96x96.png
		})
		
	}
	private async getTitle(url:string):Promise<string>{
		
	 //let pattern:RegExp = /(?:\.?)(\w+)(?:\.)/g;
	//	console.log(url.match(pattern),url)
	
   //let domainName = url.match(pattern)[1];
	
	//  if(!domainName) {
	// 	console.log('something with url')
	// 	return ;
	//  }

	let htmlText = "";
	let command = "curl '" + url + "'"; 
  let {stdout} = await execP(command)

	//console.log(stdout)
	htmlText = stdout;
	const doc = p(htmlText);
  
	
  let titleValue:string = doc.querySelector("title")?.text || "" ;
	let valueURL = new URL(url)

	if(titleValue.includes("Your browser is deprecated, please upgrade.")) {
		titleValue = valueURL.hostname;
	}

	// console.log(titleValue, "something new")
	let iconURL = doc.querySelector("[rel='icon']")?.attributes.href || "novalue"; // icon value without downloading.

	if(iconURL[0] == "/") {
		let originValue = valueURL.origin ;
		//console.log(valueURL)
		iconURL = valueURL+iconURL;
	}

	this.imageURL = iconURL;

	console.log(iconURL, doc, titleValue)	

	return titleValue;
	
	// try {
	//cannot use the fetch as the origin is custom and blocked by website's server CORS policy
  //   //const response = await fetch(url);
  //   //if (!response.ok) {
  //   //  throw new Error(`Response status: ${response.status}`);
  //   //}

   
   

  // } catch (e) {
  //   console.error(e);
  // }
	}
	


	}