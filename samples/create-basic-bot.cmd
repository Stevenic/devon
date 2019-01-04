az login
rem list subscriptions by name
az account list --query [*].name
rem set default subscription
az account set -s "Bot Service Testing (Production)"
rem list resource groups in the subscription by name
az group list --query [*].name
rem set the default resource group
az configure --defaults group=hailiuprodbots
rem list all bots in the defauult resource group
az resource list --query [?type=='Microsoft.BotService/botServices'].name
rem create a new nodejs bot
az bot create --name devondemo --kind webapp --lang Node --version v4 --appid "88488293-7162-4679-afac-75b9a753e22a" --password "acfoSGNOC2=ctlDT0858{%$" --verbose
rem download bot code to local drive
az bot download --name devondemo --save-path .\lib
rem get ARM token
az account get-access-token --query accessToken
rem get LUIS authoring key
curl https://api.luis.ai/api/v2.0/bots/programmatickey  -H "Authorization:Bearer {accessToken}"
rem download basic bot luis model
curl https://raw.githubusercontent.com/Microsoft/BotBuilder-Samples/master/samples/javascript_nodejs/13.basic-bot/deploymentScripts/msbotClone/34.luis --output .\lib\devondemo\deploymentScripts\msbotClone\34.luis
curl https://raw.githubusercontent.com/Microsoft/BotBuilder-Samples/master/samples/javascript_nodejs/13.basic-bot/deploymentScripts/msbotClone/bot.recipe --output .\lib\devondemo\deploymentScripts\msbotClone\bot.recipe
rem create luis app for the bot
pushd .\lib\devondemo
msbot clone services --name devondemo3 --luisAuthoringKey "bd3bf441221c4e3f89a426abf99847ec"  --location westus --sdkLanguage Node --sdkVersion v4 --folder ./deploymentScripts/msbotClone --appId "88488293-7162-4679-afac-75b9a753e22a" --appSecret "acfoSGNOC2=ctlDT0858{%$" --verbose
popd
