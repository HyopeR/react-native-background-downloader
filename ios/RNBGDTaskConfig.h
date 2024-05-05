#import <Foundation/Foundation.h>

@interface RNBGDTaskConfig : NSObject <NSCoding, NSSecureCoding>

@property NSString *_Nonnull id;
@property NSString *_Nonnull destination;
@property NSString *_Nonnull metadata;
@property BOOL reportedBegin;

- (id _Nullable)initWithDictionary:(NSDictionary *_Nonnull)dict;

@end

@implementation RNBGDTaskConfig

- (id _Nullable)initWithDictionary:(NSDictionary *_Nonnull)dict
{
    self = [super init];
    if (self)
    {
        self.id = dict[@"id"];
        self.destination = dict[@"destination"];
        self.metadata = dict[@"metadata"];
        self.reportedBegin = NO;
    }

    return self;
}

- (void)encodeWithCoder:(nonnull NSCoder *)aCoder
{
    [aCoder encodeObject:self.id forKey:@"id"];
    [aCoder encodeObject:self.destination forKey:@"destination"];
    [aCoder encodeObject:self.metadata forKey:@"metadata"];
    [aCoder encodeBool:self.reportedBegin forKey:@"reportedBegin"];
}

- (nullable instancetype)initWithCoder:(nonnull NSCoder *)aDecoder
{
    self = [super init];
    if (self)
    {
        self.id = [aDecoder decodeObjectForKey:@"id"];
        self.destination = [aDecoder decodeObjectForKey:@"destination"];

        // metadata CAN BE nil AFTER UPGRADE FROM VERSION WHERE WAS NO PROP "metadata"
        NSString *metadata = [aDecoder decodeObjectForKey:@"metadata"];
        if (metadata == nil)
            metadata = @"{}";
        self.metadata = metadata;

        self.reportedBegin = [aDecoder decodeBoolForKey:@"reportedBegin"];
    }

    return self;
}

+ (BOOL)supportsSecureCoding
{
    return YES;
}

@end
