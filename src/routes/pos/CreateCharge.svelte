<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import { goto } from '$app/navigation';
	import { storeName, publicKey, pmtAmt, selectedMint } from '../stores.js';
    import * as KioskBoard from 'kioskboard';
	import englishKeypbad from "../../keyboards/kioskboard-keys-english.json"
    import Keyboard from "svelte-keyboard";
	import bonkLogo from "../../lib/images/BonkLogo.png"
    import solLogo from "../../lib/images/solanaLogoMark.png"
    import dustLogo from "../../lib/images/DustLogo.jpg"
    import foxyLogo from "../../lib/images/foxy.png"
    import tetherLogo from "../../lib/images/tether.png"


    const keys = [  { row: 0, value: "1"}, { row: 0, value: "2"}, { row: 0, value: "3"}, 
                    { row: 1, value: "4"}, { row: 1, value: "5"}, { row: 1, value: "6"},
           

         { row: 2, value: "7"}, { row: 2, value: "8"}, { row: 2, value: "9"},
                    { row: 3, value: "<" }, { row: 3, value: "0"}, { row: 3, value: "."}];
	let keyboardRef = null;
    let keyboardLoaded = false
    let maxDecimals = 4
    let left = ""
    let right = ""
    let decimalsActive = false

    onMount(async () => {
        

       
    // Initialize KioskBoard (default/all options)

    
        
    })
    onDestroy(async ()=> {
        //document.body.setAttribute('tabindex', '-1');
    

    })
    async function createStore() {
        goto('/present', { state: { foo: 'bar' } });
	}
    const onKeydown = (event) => {
       
        if (event.detail == "<") {
            if (!decimalsActive) {
                left = left.slice(0, -1)
            }
            else {
              

  right = right.slice(0, -1)
                if (right == "") {
                    decimalsActive = false
                }

                
            }
         

    
        }
        else if (event.detail == ".") {
            decimalsActive = true
        }
        else {
            if (!decimalsActive) {
                left += event.detail
            
			}
 
           else {

                right.length < 4?
				right += event.detail : ""
            }
           
        }
        if (right.length > 2){
            $pmtAmt = Number(left.toString()+"."+right.toString()).toFixed(4)
        }
        else {
            $pmtAmt = Number(left.toString()+"."+right.toString()).toFixed(2)
        }
 

       if (left == "") {
            $pmtAmt = Number("0").toFixed(2)
       
        }
        $pmtAmt = parseFloat( $pmtAmt ).toLocaleString("en", {minimumFractionDigits:2, maximumFractionDigits: 4 })
        //console.log(parseFloat( $pmtAmt ).toLocaleString("en", { maximumFractionDigits: 4 }))
       
    }
</script>

<div class="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200">
    <div class="card-body p-8 items-center text-center">
    
	    <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Enter Charge Amount</h2>
        
        <div class="flex items-center space-x-2">
            {#if $selectedMint == "USDC"}
                <svg class="h-9 w-9" xmlns="http://www.w3.org/2000/svg" data-name="86977684-12db-4850-8f30-233a7c267d11" viewBox="0 0 2000 2000">
                    <path d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 
					0 1000s445.83 1000 1000 1000z" fill="#2775ca"/>
                    <path d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z" fill="#fff"/>
                  
					  <path d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z" fill="#fff"/>
                </svg>
            {:else if $selectedMint == "SOL"}
 
               <img src={solLogo} class="w-10" alt="SOL" />
            {:else if $selectedMint == "DUST"}
                <img src={dustLogo} class="w-10 rounded-full" alt="DUST" />
            {:else if $selectedMint == "FOXY"}
                <img src={foxyLogo} class="w-10 rounded-full" alt="FOXY" />
       
		     {:else if $selectedMint == "USDT"}
                <img src={tetherLogo} class="w-10" alt="USDT" />  
            {:else if $selectedMint == "BONK"}
                <img src={bonkLogo} class="w-10 rounded-full" alt="BONK" />  
            {/if}
            <input bind:value={$pmtAmt} class="input input-bordered w-48 text-right 
			text-xl" placeholder={`Enter ${$selectedMint} amount`} />
        </div>

        <div class="mt-4 w-full max-w-xs">
            <Keyboard custom="{keys}" on:keydown="{onKeydown}" />
        </div>
        
        <div class="card-actions justify-center mt-6">
            <button on:click={createStore} class="btn btn-primary btn-wide text-white font-greycliffbold normal-case">
                
				Create QR Code
            </button>
        </div>
    </div>
</div>
