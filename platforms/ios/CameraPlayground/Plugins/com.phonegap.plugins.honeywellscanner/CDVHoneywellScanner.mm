#import <Cordova/CDVPlugin.h>
#import "Captuvo.h"

//------------------------------------------------------------------------------
// plugin definition
//------------------------------------------------------------------------------
@interface CDVHoneywellScanner : CDVPlugin <CaptuvoEventsProtocol>
- (void)trigger:(CDVInvokedUrlCommand*)command;
@end

//------------------------------------------------------------------------------
// plugin internals
//------------------------------------------------------------------------------
@implementation CDVHoneywellScanner

- (void)pluginInitialize {
    [super pluginInitialize];
    //[[Captuvo sharedCaptuvoDevice]startDecoderHardware];
    Captuvo* scanner = [Captuvo sharedCaptuvoDevice];
    [scanner startDecoderHardware];
    NSString* name = [scanner getCaptuvoName];
    NSString* version = [scanner getCaptuvoSerialNumber];
    
    NSString* message = [NSString stringWithFormat:@"pluginInitialize: %@  - %@", name, version];
    [self prompt:message];
    
    [scanner addCaptuvoDelegate:self];
}

- (void)dispose {
    [self prompt:@"plugin dispose"];
    Captuvo* scanner = [Captuvo sharedCaptuvoDevice];
    [scanner removeCaptuvoDelegate:self];
    [scanner stopDecoderHardware];
    [super dispose];
}

//--------------------------------------------------------------------------
// CaptuvoEventsProtocol methods
//--------------------------------------------------------------------------

- (void) decoderDataReceived:(NSString*)data {
    NSString* message = [NSString stringWithFormat:@"data received: %@", data];
    [self prompt:message];
}

//--------------------------------------------------------------------------
// Cordova methods
//--------------------------------------------------------------------------
- (void)trigger:(CDVInvokedUrlCommand*)command {
    [[Captuvo sharedCaptuvoDevice]startDecoderScanning];
}

- (void)registerCallback:(CDVInvokedUrlCommand*)command {
    NSString* callback = [command.arguments objectAtIndex:0];
    [self prompt:callback];
}
    
- (void)prompt:(NSString*) message {
    UIAlertView* alert = [[UIAlertView alloc] initWithTitle:@"Honeywell Scanner"
                                                    message:message
                                                   delegate:nil
                                          cancelButtonTitle:@"OK"
                                          otherButtonTitles:nil];
    [alert show];
}

@end

